const { readAllInfo } = require('../mongodb/mongodb');
const config = require('../config/config');

// app is so small and static so no need for
// anything more the just a variable to keep
// current informations
const STATE = {
	aboutMe: {
		createdAt: new Date(2000, 1, 1),
		text: ''
	},
	repos: [],
	skills: {
		techStack: []
	},
	socials: {},
	education: []
};

async function loadState() {
	return refreshDynamicState();
}

function setStateInterval() {
	setInterval(refreshDynamicState, config.refreshStateInterval);
	console.log(
		new Date().toUTCString(),
		'refresh state interval set, time:',
		config.refreshStateInterval
	);
}

async function refreshDynamicState() {
	const info = await readAllInfo();

	for (const key in info) {
		if (!info[key]) {
			continue;
		}

		if (Array.isArray(info[key]) && info[key].length === 0) {
			continue;
		}

		if (typeof info[key] !== 'object') {
			continue;
		}

		STATE[key] = info[key];
	}
	console.log(new Date().toUTCString(), 'state dynamic fields refreshed');
}

module.exports = {
	loadState: loadState,
	setStateInterval: setStateInterval,
	getState: () => STATE
};
