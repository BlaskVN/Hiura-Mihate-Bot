const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		if (!interaction.guild) {
            return interaction.reply('Bạn không thể dùng lệnh này trong DMs!');
        }
		// await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
		
		const serverEmbed = new EmbedBuilder()
            .setTitle('Server Info')
            .setDescription(`Information about ${interaction.guild.name}`)
            .addFields(
                { name: 'Name', value: interaction.guild.name },
                { name: 'ID', value: interaction.guild.id },
                { name: 'Members', value: interaction.guild.memberCount.toString() },
                { name: 'Created', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:f>` },
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }) ?? null)
            .setColor(0x0099ff);

        await interaction.reply({ embeds: [serverEmbed] });
	},
};