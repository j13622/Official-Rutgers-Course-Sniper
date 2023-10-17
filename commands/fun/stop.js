const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Use this command to stop sniping course(s)'),
	async execute(interaction) {
		await interaction.showModal(interaction.modal);
	},
};