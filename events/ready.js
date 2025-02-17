const { Events, ActivityType, PresenceUpdateStatus  } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setPresence({
			activities: [{ name: 'Midou Kenshirou cực căng', type: ActivityType.Playing }], // .Listening, .Watching, .Competing, .Streaming, .Playing, .Custom
			status: PresenceUpdateStatus.Online, // .Online, .Idle, .DoNotDisturb, .Invisible
		});
	},
};