const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		let add = true;
		let str1 = 'You will get a DM when the following courses become available: ';
		if (interaction.customId == 'stopModal') {
			add = false;
			str1 = 'You have stopped sniping the following courses: ';
		}
		console.log(interaction);
		const courseTags = interaction.fields.getTextInputValue('courseTags');
		const courseSections = interaction.fields.getTextInputValue('courseSections');
		const courseSectionsArray = courseSections.split(' ');
		const courseTagsArray = courseTags.split(' ');
		const re1 = new RegExp('^\\d{2}:\\d{3}:\\d{3}$');
		const re2 = new RegExp('^\\d{5}$');
		const failSet = new Set();
		const passSet = new Set();
		for (const i of courseTagsArray) {
			if (re1.test(i) && interaction.client.tagSection.has(i)) {
				passSet.add(i);
				const indices = interaction.client.tagSection.get(i);
				for (const val of indices) {
					if (interaction.client.sectionUser.get(val) != null) {
						const userSet = interaction.client.sectionUser.get(val);
						if (!userSet.has(interaction.user.id) && add) {
							userSet.add(interaction.user.id);
						} else if (userSet.has(interaction.user.id) && !add) {
							userSet.delete(interaction.user.id);
						}
					} else if (add) {
						const userSet = new Set();
						userSet.add(interaction.user.id);
						interaction.client.sectionUser.set(val, userSet);
					}
				}
			} else {
				failSet.add(i);
			}
		}
		for (const i of courseSectionsArray) {
			if (re2.test(i) && interaction.client.sectionUser.has(i)) {
				passSet.add(i);
				if (interaction.client.sectionUser.get(i) != null) {
					const userSet = interaction.client.sectionUser.get(i);
					if (!userSet.has(interaction.user.id) && add) {
						userSet.add(interaction.user.id);
					} else if (userSet.has(interaction.user.id) && !add) {
						userSet.delete(interaction.user.id);
					}
				} else if (add) {
					const userSet = new Set();
					userSet.add(interaction.user.id);
					interaction.client.sectionUser.set(i, userSet);
				}
			} else {
				failSet.add(i);
			}
		}
		let replyMessage = '';
		failSet.delete('');
		passSet.delete('');
		if (passSet.size != 0) {
			// eslint-disable-next-line quotes
			replyMessage = `Received! ${str1}`;
			for (const val of passSet) {
				replyMessage = replyMessage + val + ' ';
			}
			replyMessage = replyMessage + '\n';
		}
		if (courseTagsArray[0] == '' && courseSectionsArray[0] == '') {
			replyMessage = 'It seems you did not submit anything. Please fill out one or both of the queries.';
		} else if (failSet.size != 0) {
			replyMessage = replyMessage + 'We could not find the following courses: ';
			for (const val of failSet) {
				replyMessage = replyMessage + val + ' ';
			}
		}
		interaction.reply({ content: replyMessage, ephemeral: true });
	},
};