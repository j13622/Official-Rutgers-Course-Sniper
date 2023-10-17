const { Events, Collection } = require('discord.js');
const fs = require('fs');
const { link1, link2, link3 } = require('../config.json');

const exEmbed = {
	color: 0xee337e,
	title: 'Official Rutgers Course Sniper',
	thumbnail: {
		url: 'https://i.imgur.com/6Xxx18A.jpg',
	},
	timestamp: new Date().toISOString(),
};

let count = 0;

function replacer(key, value) {
	if (value instanceof Set) {
		const arr = Array.from(value);
		return arr;
	}
	return value;
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		setInterval(async () => {
			const date = new Date();
			const year = date.getFullYear();
			const month = date.getMonth();
			let term = 9;
			if (month >= 9 && month < 10) {
				term = 0;
			} else if (month >= 10 || month < 2) {
				term = 1;
			} else if (month >= 2 && month < 3) {
				term = 7;
			}
			try {
				const link = link1 + year + link2 + term + link3;
				const regJson = await fetch(link);
				const courseData = await regJson.json();
				const courseOpenStatus = new Collection();
				// map for tag -> set of sections should only change when the term changes, or when client starts
				// also every key for section -> user map gets initialized so anything not in keys is not real.
				// eslint-disable-next-line no-loss-of-precision
				if (client.term == null || client.term != term) {
					const courseTagSection = new Collection();
					const courseSectionUser = new Collection();
					const courseSectionName = new Collection();
					const courseSectionTime = new Collection();
					for (let i = 0; i < courseData.length; i++) {
						const str = courseData[i]['courseString'];
						const title = courseData[i]['title'];
						const sections = courseData[i]['sections'];
						const secSet = new Set();
						for (let j = 0; j < sections.length; j++) {
							const index = sections[j]['index'];
							courseSectionUser.set(index, null);
							courseSectionName.set(index, title);
							secSet.add(index);
							const meet = sections[j]['meetingTimes'];
							const meetingTimes = Array(meet.length * 3);
							for (let k = 0; k < meet.length; k++) {
								let meetDay = meet[k]['meetingDay'];
								if (meetDay == 'H') {
									meetDay = 'Th';
								}
								meetingTimes[k * 3] = meetDay;
								meetingTimes[k * 3 + 1] = meet[k]['startTime'];
								meetingTimes[k * 3 + 2] = meet[k]['endTime'];
							}
							courseSectionTime.set(index, meetingTimes);
						}
						courseTagSection.set(str, secSet);
					}
					client.tagSection = courseTagSection;
					client.sectionUser = courseSectionUser;
					client.sectionName = courseSectionName;
					client.sectionTime = courseSectionTime;
				}
				// map for section -> openstatus should change every second
				for (let i = 0; i < courseData.length; i++) {
					const sections = courseData[i]['sections'];
					for (let j = 0; j < sections.length; j++) {
						const index = sections[j]['index'];
						const openStatus = sections[j]['openStatusText'];
						courseOpenStatus.set(index, openStatus);
					}
				}
				for (const [key, value] of courseOpenStatus) {
					if (client.courses.get(key) && client.courses.get(key) == 'CLOSED' && value == 'OPEN') {
						const usersToDm = client.sectionUser.get(key);
						if (client.isIterable (usersToDm)) {
							const meetTimes = client.sectionTime.get(key);
							let timeStr = '';
							for (let i = 0; i < meetTimes.length; i++) {
								if (i % 3 == 0) {
									timeStr = timeStr + meetTimes[i] + ' - ';
								} else {
									let str = meetTimes[i];
									str = str.substring(0, 2) + ':' + str.substring(2);
									timeStr = timeStr + str;
									if (i % 3 == 1) {
										timeStr = timeStr + ' to ';
									} else {
										timeStr = timeStr + '\n';
									}
								}
							}
							exEmbed.fields = [
								{
									name: 'New Open Section Available!',
									value: client.sectionName.get(key) + '\n' + timeStr + 'Section: ' + key,
								},
								{
									name: '\u200b',
									value: `[Click Here to Join!](http://sims.rutgers.edu/webreg/editSchedule.htm?login=cas&semesterSelection=${term}${year}&indexList=${key},)`,
								},
							];
							for (const i of usersToDm) {
								client.users.send(i, { embeds: [exEmbed] });
							}
						}
					}
				}
				client.courses = courseOpenStatus;
				client.term = term;
			} catch {
				console.log('fetch error');
			}
			count++;
			if (count == 3600) {
				count = 0;
				const fromEntries = Object.fromEntries(client.sectionUser);
				const sectionJson = JSON.stringify(fromEntries, replacer);
				fs.writeFile('sectionUsers.json', sectionJson, function(err) {
					if (err) {
						console.log(err);
					}
				});
			}
		}, 1000);
	},
};