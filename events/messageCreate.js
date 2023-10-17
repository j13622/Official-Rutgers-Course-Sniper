const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(interaction) {
		if (interaction['interaction'] == null && interaction['author']['id'] != '703340146468061244') {
			interaction.delete();
		}
	},
};