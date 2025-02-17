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

        const messageFields = [];
        let count = 1;
        for (const [, msg] of messages) {
            messageFields.push({
                name: `Tin nhắn #${count}`,
                value: msg.content || 'Không có nội dung',
            });
            count++;
        }

        function chunkArray(array, size) {
            const result = [];
            for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
            }
            return result;
        }

        const chunkedFields = chunkArray(messageFields, 25);

        chunkedFields.forEach((fieldsGroup, index) => {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Bulk Message Purge')
                .setDescription(`Một loạt tin nhắn đã bị xóa - Total: ${messages.size}\nTrang ${index + 1} / ${chunkedFields.length}`)
                .addFields(fieldsGroup);

            logChannel.send({ embeds: [embed] });
        });
    },
};