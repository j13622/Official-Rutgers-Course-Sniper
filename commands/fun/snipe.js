const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('snipe')
		.setDescription('Use this command to view the course-sniping form'),
	async execute(interaction) {
		await interaction.showModal(interaction.modal);
	},
};