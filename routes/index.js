var express = require('express');
var router = express.Router();
const axios = require('axios').default;
const fs = require('fs/promises');
const path = require('path');

const REPOS_URL = 'https://api.github.com/users/unnamedxaer/repos';

/* GET home page. */
router.get('/', async function (req, res, next) {
	try {
		var repos = await getRepos();
	} catch (err) {
		console.log(err);
		next(err);
		return;
	}

	res.render('index', { title: 'UnnamedXAer', repos: repos });
});

async function getRepos() {
	const maxTime = 1000 * 60 * 60;

	const savedReposData = await readSavedRepos();
	if (savedReposData) {
		if (Date.parse(savedReposData.fetchedAt) > Date.now() - maxTime) {
			return savedReposData.repos;
		}
	}

	const newRepos = await fetchRepos();
	if (newRepos) {
		updateReposProps(newRepos);
		// call save func and do not wait.
		saveRepos(newRepos);
		return newRepos;
	}

	// return saved repos in case fetch failed.
	return savedReposData.repos;
}

async function fetchRepos() {
	try {
		const { data } = await axios.get(REPOS_URL);
		return data;
	} catch (err) {
		console.error('fetch repos: ', err);
	}

	return null;
}

function updateReposProps(repos) {
	let repo;
	for (let i = repos.length - 1; i >= 0; i--) {
		repo = repos[i];
		repo.cssColorClass = repo.language
			? `color-${repo.language
					.toLowerCase()
					.replace('#', 'sharp')
					.replace(/\s+/g, '-')}`
			: '';
		delete repo.owner;
	}
}

async function readSavedRepos() {
	const dir = './data/repos.json';
	try {
		const data = await fs.readFile(dir, {
			encoding: 'utf8'
		});
		return JSON.parse(data);
	} catch (err) {
		console.error('read repos: ', err);
	}

	return null;
}

async function saveRepos(repos) {
	const date = new Date();
	const filename = 'repos.json';
	const dir = './data';
	const payload = {
		fetchedAt: date,
		repos: repos
	};

	try {
		await fs.mkdir(dir, { recursive: true });
	} catch (err) {
		if (err.code !== 'EEXIST') {
			console.error(
				`fail to save repos (${date.toUTCString()}): create dir: `,
				err
			);
			return;
		}
	}

	try {
		const filePath = path.join(dir, filename);
		await fs.writeFile(filePath, JSON.stringify(payload), {
			encoding: 'utf8',
			flag: 'w+'
		});
		console.log(`repos (${repos.length}) saved at ${date.toUTCString()}`);
	} catch (err) {
		console.error(`fail to save repos (${date.toUTCString()}): `, err);
	}
}

module.exports = router;
