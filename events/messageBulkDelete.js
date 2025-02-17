const { Events, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    name: Events.MessageBulkDelete,
    async execute(messages) {
        if (messages.size === 0) return;
        
        const logSettings = JSON.parse(fs.readFileSync('logSettings.json', 'utf8'));
        const guild = messages.first().guild;
        const guildSettings = logSettings[guild.id];
        if (!guildSettings || !guildSettings.enabled) return;

        const logChannelId = guildSettings.channelId;
        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        // Lấy tên kênh
        const channelName = messages.first().channel?.name
            ? `#${messages.first().channel.name}`
            : '#None';
        
        const lines = [];
        for (const [, msg] of messages) {
            const username = msg.author?.username ?? 'Unknown';
            lines.push(`\`[${username}]: ${msg.content || 'Không có nội dung'}\``);
        }
        
        let messageString = `**${messages.size}** messages purged\n`;
        messageString += lines.join('\n');

        function chunkString(str, size) {
            const chunks = [];
            for (let i = 0; i < str.length; i += size) {
                chunks.push(str.slice(i, i + size));
            }
            return chunks;
        }

        const pieces = chunkString(messageString, 4096);

        pieces.forEach((piece, index) => {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Message Purged in ' + channelName)
                .setDescription(piece + `\nTrang ${index + 1}/${pieces.length}`);
            logChannel.send({ embeds: [embed] });
        });
    },
};