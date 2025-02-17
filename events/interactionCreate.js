const { Events, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Không tìm thấy lệnh có tên ${interaction.commandName}`);
            return;
        }

        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Map());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1_000;
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: `Vui lòng đợi ${timeLeft.toFixed(1)} giây trước khi sử dụng lệnh \`${command.data.name}\``, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: `Vui lòng đợi ${timeLeft.toFixed(1)} giây trước khi sử dụng lệnh \`${command.data.name}\``, flags: MessageFlags.Ephemeral });
                }
                return;
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Lỗi khi thực thi lệnh!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'Lỗi khi thực thi lệnh!', flags: MessageFlags.Ephemeral });
            }
        }
	},
};