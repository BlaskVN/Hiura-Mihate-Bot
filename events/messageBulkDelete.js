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

        const channelName = messages.first().channel?.name
            ? `#${messages.first().channel.name}`
            : '#None';

        // Chia nhỏ tin nhắn thành các nhóm nhỏ hơn
        const messageGroups = [];
        let currentGroup = [];
        let currentLength = 0;
        const MAX_LENGTH = 4000; // Để lại khoảng trống cho các thông tin khác

        for (const [, msg] of messages) {
            const username = msg.author?.username ?? 'Unknown';
            const content = msg.content || 'Không có nội dung';
            const messageText = `[${username}]: ${content}\n`;
            
            if (currentLength + messageText.length > MAX_LENGTH) {
                messageGroups.push(currentGroup);
                currentGroup = [];
                currentLength = 0;
            }
            
            currentGroup.push(messageText);
            currentLength += messageText.length;
        }
        
        if (currentGroup.length > 0) {
            messageGroups.push(currentGroup);
        }

        // Gửi từng nhóm tin nhắn
        for (let i = 0; i < messageGroups.length; i++) {
            const group = messageGroups[i];
            const description = `**${messages.size}** tin nhắn đã bị xóa\n\`\`\`\n${group.join('')}\`\`\`\nPage ${i + 1}/${messageGroups.length}`;
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(`Tin nhắn bị xóa hàng loạt trong ${channelName}`)
                .setDescription(description);
            
            await logChannel.send({ embeds: [embed] });
        }
    },
};