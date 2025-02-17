const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Hiển thị thông tin người dùng.'),

	async execute(interaction) {
		const user = interaction.user; 
		const member = interaction.member; 

		const userEmbed = new EmbedBuilder()
			.setColor("#58b9ff")
			.setTitle(`Thông tin của ${user.username}`)
			.setImage(user.displayAvatarURL({ dynamic: true, size: 4096 })) 
			.addFields(
				{ name: "🆔 ID:", value: user.id, inline: true },
				{ name: "👤 Username:", value: user.username, inline: true },
				{ name: "🏷️ Tag:", value: user.tag, inline: true },
				{ name: "📆 Ngày tạo tài khoản:", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`, inline: false },
			);

		if (member) {
			userEmbed.addFields(
				{ name: "📌 Ngày tham gia server:", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: false }
			);
		}

		await interaction.reply({ embeds: [userEmbed] });
	},
};
