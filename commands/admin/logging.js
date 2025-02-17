const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logging')
        .setDescription('Cài đặt log tin nhắn.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Channel dùng để gửi log tin nhắn')
                .setRequired(false))
        .addBooleanOption(option => 
            option.setName('enable')
                .setDescription('Bật hoặc tắt log')
                .setRequired(false))
        .addBooleanOption(option => 
            option.setName('clear')
                .setDescription('Xóa cài đặt log hiện tại')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bạn không có quyền thực hiện lệnh này.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const enable = interaction.options.getBoolean('enable');
        const deleteSetting = interaction.options.getBoolean('clear');
        const guildId = interaction.guild.id;

        const logSettings = JSON.parse(fs.readFileSync('logSettings.json', 'utf8'));

        if (deleteSetting) {
            delete logSettings[guildId];
            fs.writeFileSync('logSettings.json', JSON.stringify(logSettings, null, 2));
            return interaction.reply('Cài đặt log đã được xóa.');
        }

        if (!logSettings[guildId]) {
            if (!channel) {
                return interaction.reply({ content: 'Bạn phải chỉ định một channel để gửi log tin nhắn.', ephemeral: true });
            }
            logSettings[guildId] = { channelId: channel.id, enabled: enable !== undefined ? enable : true };
        } else {
            if (channel) {
                logSettings[guildId].channelId = channel.id;
            }
            if (enable !== undefined) {
                logSettings[guildId].enabled = enable;
            }
        }

        fs.writeFileSync('logSettings.json', JSON.stringify(logSettings, null, 2));

        const currentSettings = logSettings[guildId];
        await interaction.reply(`Log tin nhắn được gửi vào <#${currentSettings.channelId}> và đang ${currentSettings.enabled ? 'bật' : 'tắt'}.`);
    },
};