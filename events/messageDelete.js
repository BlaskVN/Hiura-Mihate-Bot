const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (message.partial) return;

        const logSettings = JSON.parse(fs.readFileSync('logSettings.json', 'utf8'));
        const guildSettings = logSettings[message.guild.id];
        if (!guildSettings || !guildSettings.enabled) return;

        const logChannelId = guildSettings.channelId;
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (!logChannel) return; 

        if (message.author.bot && message.channel.id === logChannelId) return;

        const fetchedLogs = await message.guild.fetchAuditLogs({
            limit: 1,
            type: 72,
        });
        const deletionLog = fetchedLogs.entries.first();

        let executor = 'NULL';
        if (deletionLog) {
            const { executor: user, target } = deletionLog;
            if (target.id === message.author.id) {
                executor = user;
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Message Deleted')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Author', value: `${message.author}`, inline: true },
                { name: 'Tag', value: message.author.tag, inline: true },
                { name: 'Channel', value: `${message.channel}`, inline: false },
                { name: 'Content', value: message.content || 'Méo có đâu mà đọc XD', inline: false }
            );
        
        if (executor !== 'NULL') {
            embed.addFields(
                { name: 'Deleted by', value: `${executor}`,inline: true },
                { name: 'Tag', value: executor.tag, inline: true }
            );
        }

        embed.addFields(
            { name: 'Time deleted', value: `<t:${Math.floor(message.createdTimestamp / 1000)}:f>`, inline: false }
        );
        
        const files = [];
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                files.push(new AttachmentBuilder(attachment.url, { name: attachment.name }));
            });
        }

        logChannel.send({ embeds: [embed] });
        if (files.length > 0) {
            logChannel.send({ files });
        }
    },
};