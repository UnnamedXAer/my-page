const mongo = require('mongodb').MongoClient;
const { default: axios } = require('axios');
const config = require('../config/config');

async function connect() {
	const { mongoUser, mongoPassword, mongoDB } = config;
	const uri = `mongodb+srv://${mongoUser}:${mongoPassword}@cluster0.z65ki.mongodb.net/${mongoDB}?retryWrites=true`;
	try {
		const client = await mongo.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});

		return client;
	} catch (err) {
		console.error(new Date().toUTCString(), 'mongodb connect: ', err);
		throw err;
	}
}

async function readAllInfo() {
	const client = await connect();
	const db = client.db();
	const results = await Promise.all([
		getAboutMe(db),
		getRepos(db),
		getSocials(db),
		getEducation(db)
	]);

	console.log(new Date().toUTCString(), 'readAllInfo: closing mongodb connection');
	client
		.close()
		.then((res) =>
			console.log(new Date().toUTCString(), 'mongodb connection closed', res)
		)
		.catch((err) =>
			console.error(
				new Date().toUTCString(),
				'mongodb connection close failed',
				err
			)
		);
	let c = 0;
	return {
		aboutMe: results[c++],
		repos: results[c++],
		socials: results[c++],
		education: results[c++],
		skills: results[c++]
	};
}

async function getRepos(db) {
	console.log(new Date().toUTCString(), 'about to get: repos');
	if (config.env !== 'production') {
		const repos = require('../data/repos.json');
		console.log(new Date().toUTCString(), 'repos: results: ', repos);
		return sortRepos(repos.map((r) => ({ ...r, pushedAt: new Date(r.pushedAt) })));
	}

	const col = db.collection('repos');
	const options = {
		headers: {
			Accept: 'application/vnd.github.mercy-preview+json',
			'User-Agent': config.githubUsername
		}
	};
	const baseURL = `https://api.github.com/repos/${config.githubUsername.toLowerCase()}/`;
	let repoNames;
	try {
		const data = await col.findOne({});
		repoNames = data.include;
	} catch (err) {
		console.error(new Date().toUTCString(), 'mongodb: get repos: ', err);
		return [];
	}

	const promises = repoNames.map((prName) => {
		const url = baseURL + prName;
		return axios.get(url, options);
	});
	const repos = [];
	(await Promise.allSettled(promises)).forEach((result, idx) => {
		console.log(result);
		if (result.status !== 'fulfilled') {
			console.error(
				new Date().toUTCString(),
				'github: fetch repo: ',
				repoNames[idx],
				result.reason.response.data || result.reason.response.statusText
			);
			return;
		}
		const repoData = result.value.data;
		repos.push({
			name: repoData.name,
			language: repoData.language,
			url: repoData.html_url,
			homepage: repoData.homepage,
			description: repoData.description,
			topics: repoData.names,
			pushedAt: new Date(repoData.pushed_at),
			cssColorClass: repoData.language
				? `color-${repoData.language
						.toLowerCase()
						.replace('#', 'sharp')
						.replace(/\s+/g, '-')}`
				: ''
		});
	});

	console.log(new Date().toUTCString(), 'projects: results: ', repos);
	return sortRepos(repos);
}

async function getEducation(db) {
	console.log(new Date().toUTCString(), 'about to get: education');
	const col = db.collection('education');
	const cursor = await col.find(
		{},
		{ projection: { _id: 0 }, sort: { startDate: -1 } }
	);

	const education = [];
	await cursor.forEach((edu) => {
		education.push({ ...edu });
	});
	cursor
		.close()
		.catch((err) =>
			console.error(
				new Date().toUTCString(),
				'mongodb getEducation close cursor:',
				err
			)
		);
	return education;
}

async function getAboutMe(db) {
	console.log(new Date().toUTCString(), 'about to get: aboutMe');
	const col = db.collection('aboutMe');
	const result = await col.findOne(
		{},
		{ sort: { $natural: -1 }, projection: { _id: 0 } }
	);
	return result;
}

async function getSocials(db) {
	console.log(new Date().toUTCString(), 'about to get: socials');
	const col = db.collection('socials');
	const result = await col.findOne({}, { projection: { _id: 0 } });
	return result;
}

function sortRepos(repos) {
	return repos.sort(function (a, b) {
		const num = b.pushedAt.getTime() - a.pushedAt.getTime();
		return num;
	});
}

module.exports = {
	readAllInfo: readAllInfo
};
