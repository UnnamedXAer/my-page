const axios = require('axios').default;
const fs = require('fs/promises');
const path = require('path');

// app is so small and static so no need for
// anything more the just a variable to keep
// current informations
const STATE = {
	aboutMe: {
		fetchedAt: new Date(2000, 1, 1),
		text: ''
	},
	projects: {
		fetchedAt: new Date(2000, 1, 1),
		repos: []
	},
	socials: {},
	githubUsername: '',
	logoURL: '',
	education: [],
	config: {
		env: 'development',
		refreshStateInterval: 1000 * 60 * 60 * 24,
		aboutMeMaxAge: 1000 * 60 * 60 * 24,
		projectsMaxAge: 1000 * 60 * 60 * 24,
		reCAPTCHAClientKey: '',
		reCAPTCHAServerKey: '',
		appEmailAddress: '',
		appEmailPassword: '',
		smtpHost: '',
		smtpPort: NaN,
		ownerEmailAddress: ''
	}
};

function updateConfigTimeProp(key, envKey) {
	let envValue = process.env[envKey];
	let time = parseInt(envValue, 10);
	if (Number.isFinite(time) && time !== 0) {
		if (time < 0) {
			time = -time;
		}
		STATE.config[key] = time;
	}
}

async function loadState() {
	STATE.githubUsername = process.env['GITHUB_NAME'];
	STATE.logoURL = process.env['LOGO_URL'];
	STATE.config.env = process.env['NODE_ENV'];
	STATE.config.reCAPTCHAClientKey = process.env['RECAPTCHA_CLIENT_KEY'];
	STATE.config.reCAPTCHAServerKey = process.env['RECAPTCHA_SERVER_KEY'];
	STATE.config.ownerEmailAddress = process.env['OWNER_EMAIL_ADDRESS'];
	STATE.config.appEmailAddress = process.env['APP_EMAIL_ADDRESS'];
	STATE.config.appEmailPassword = process.env['APP_EMAIL_PASSWORD'];
	STATE.config.smtpHost = process.env['SMTP_HOST'];
	STATE.config.smtpPort = +process.env['SMTP_PORT'];
	updateConfigTimeProp('aboutMeMaxAge', 'ABOUT_ME_MAX_AGE');
	updateConfigTimeProp('projectsMaxAge', 'PROJECTS_MAX_AGE');
	updateConfigTimeProp('refreshStateInterval', 'REFRESH_STATE_INTERVAL');
	STATE.socials = getSocials();
	STATE.education = await getEducation();

	return refreshDynamicState();
}

async function refreshDynamicState() {
	STATE.aboutMe = await getAboutMe();
	STATE.projects = await getProjects();
	console.log(new Date().toUTCString(), 'state dynamic fields refreshed');
}

function setStateInterval() {
	setInterval(refreshDynamicState, STATE.config.refreshStateInterval);
	console.log(
		new Date().toUTCString(),
		'refresh state interval set, time:',
		STATE.config.refreshStateInterval
	);
}

async function getEducation() {
	if (STATE.education.length > 0) {
		return STATE.education;
	}

	if (STATE.config.env !== 'production') {
		const savedEducation = await readEducation();
		if (savedEducation && savedEducation.length > 0) {
			return updateState('education', savedEducation);
		}
	}

	const newEducation = await fetchEducation();
	if (newEducation && newEducation.length > 0) {
		// saveToJSONFile('education', newEducation);
		return updateState('education', newEducation);
	}

	return STATE.education;
}
async function readEducation() {
	try {
		const data = await fs.readFile('./data/education.json', 'utf8');

		const parsedData = JSON.parse(data);
		const edu = parsedData.map((edu) => ({
			school: edu.school,
			startDate: new Date(edu.startDate),
			finishDate: new Date(edu.finishDate),
			moreInfo: edu.moreInfo
		}));
		return edu;
	} catch (err) {
		console.error(new Date().toUTCString(), 'read education: ', err);
	}
	return null;
}

async function fetchEducation() {
	console.log(new Date().toUTCString(), 'about to fetch education');
	try {
		return [];
	} catch (err) {
		console.error(new Date().toUTCString(), 'fetch education:', err);
	}
}

function updateState(key, value) {
	STATE[key] = value;
	return STATE[key];
}

function getSocials() {
	const socials = {
		linkedIn: process.env['SOCIALS_LINKEDIN_URL']
	};
	return updateState('socials', socials);
}

async function getAboutMe() {
	if (
		STATE.aboutMe.fetchedAt.getTime() > Date.now() - STATE.config.aboutMeMaxAge &&
		STATE.aboutMe.text
	) {
		return STATE.aboutMe;
	}

	if (STATE.config.env !== 'production') {
		const savedAboutMe = await readAboutMe();
		if (
			savedAboutMe &&
			savedAboutMe.text &&
			savedAboutMe.fetchedAt > STATE.aboutMe.fetchedAt
		) {
			return updateState('aboutMe', savedAboutMe);
		}
	}

	const newAboutMe = await fetchAboutMe();
	if (newAboutMe && newAboutMe.text) {
		saveToJSONFile('aboutme', newAboutMe);
		return updateState('aboutMe', newAboutMe);
	}

	return STATE.aboutMe;
}

async function readAboutMe() {
	try {
		const data = await fs.readFile('./data/aboutme.json', 'utf8');

		parsedData = JSON.parse(data);
		return {
			...parsedData,
			fetchedAt: new Date(parsedData.fetchedAt)
		};
	} catch (err) {
		console.error(new Date().toUTCString(), 'read about me: ', err);
	}
	return null;
}

async function fetchAboutMe() {
	console.log(new Date().toUTCString(), 'about to fetch about me');
	try {
		return {
			fetchedAt: new Date(),
			text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
		};
	} catch (err) {
		console.error(new Date().toUTCString(), 'fetch about me:', err);
	}
}

async function getProjects() {
	if (
		STATE.projects.fetchedAt.getTime() > Date.now() - STATE.config.projectsMaxAge &&
		STATE.projects.repos
	) {
		return STATE.projects;
	}

	if (STATE.config.env !== 'production') {
		const savedProjects = await readSavedProjects();
		if (
			savedProjects &&
			savedProjects.repos &&
			savedProjects.repos.length > 0 &&
			savedProjects.fetchedAt > STATE.projects.fetchedAt
		) {
			return updateState('projects', savedProjects);
		}
	}

	const newRepos = await fetchProjects();
	if (newRepos && newRepos.repos.length > 0) {
		updateReposProps(newRepos);
		sortRepos(newRepos);
		// call save func and do not wait.
		saveToJSONFile('projects', newRepos);
		return updateState('projects', newRepos);
	}

	return STATE.projects;
}

function sortRepos(reposData) {
	return {
		...reposData,
		repos: reposData.repos.sort(function (a, b) {
			const ad = Date.parse(a['pushed_at']);
			const bd = Date.parse(b['pushed_at']);
			const num = bd - ad;
			return num;
		})
	};
}

async function fetchProjects() {
	if (!STATE.githubUsername || STATE.githubUsername.length === 0) {
		console.error(
			new Date().toUTCString(),
			'fetch projects: ',
			'github username not defined'
		);
		return null;
	}

	const reposURL = `https://api.github.com/users/${STATE.githubUsername}/repos`;

	console.log(new Date().toUTCString(), 'about to fetch projects');
	try {
		const { data } = await axios.get(reposURL);
		return {
			fetchedAt: new Date(),
			repos: data
		};
	} catch (err) {
		console.error(new Date().toUTCString(), 'fetch projects: ', err);
	}

	return null;
}

function updateReposProps(projects) {
	let repo;
	for (let i = projects.repos.length - 1; i >= 0; i--) {
		repo = projects.repos[i];
		repo.cssColorClass = repo.language
			? `color-${repo.language
					.toLowerCase()
					.replace('#', 'sharp')
					.replace(/\s+/g, '-')}`
			: '';
		delete repo.owner;
	}
}

async function readSavedProjects() {
	const dir = './data/projects.json';
	try {
		const data = await fs.readFile(dir, {
			encoding: 'utf8'
		});
		parsedData = JSON.parse(data);
		return {
			...parsedData,
			fetchedAt: new Date(parsedData.fetchedAt)
		};
	} catch (err) {
		console.error(new Date().toUTCString(), 'read repos: ', err);
	}

	return null;
}

async function saveToJSONFile(fname, data) {
	const filename = fname + '.json';
	const dir = './data';

	try {
		await fs.mkdir(dir, { recursive: true });
	} catch (err) {
		if (err.code !== 'EEXIST') {
			console.error(
				new Date().toUTCString(),
				`fail to save '${fname}': create dir:`,
				err
			);
			return;
		}
	}

	try {
		const filePath = path.join(dir, filename);
		await fs.writeFile(filePath, JSON.stringify(data), {
			encoding: 'utf8',
			flag: 'w+'
		});
		console.log(new Date().toUTCString(), `'${fname}' saved`);
	} catch (err) {
		console.error(new Date().toUTCString()`fail to save '${fname}':`, err);
	}
}

module.exports = {
	loadState: loadState,
	setStateInterval: setStateInterval,
	getState: () => STATE,
	getConfig: () => STATE.config
};
