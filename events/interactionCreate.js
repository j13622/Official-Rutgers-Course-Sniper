const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		if (interaction.commandName === 'snipe') {
			const modal = new ModalBuilder()
				.setCustomId('snipeModal')
				.setTitle('Course Snipe Form');

			const fullCourseTags = new TextInputBuilder()
				.setCustomId('courseTags')
				.setLabel('List the courses to monitor here:')
				.setPlaceholder('01:198:213 01:563:103')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(false);

			const courseSections = new TextInputBuilder()
				.setCustomId('courseSections')
				.setLabel('List the sections to monitor here:')
				.setPlaceholder('08648 07359')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(false);

			const firstActionRow = new ActionRowBuilder().addComponents(fullCourseTags);
			const secondActionRow = new ActionRowBuilder().addComponents(courseSections);

			modal.addComponents(firstActionRow, secondActionRow);

			interaction.modal = modal;
		}

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};

