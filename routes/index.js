var express = require('express');
var router = express.Router();
const { getAboutMe, getRepos } = require('../state/state');

router.get('/', async function (req, res, next) {
	const repos = await getRepos();
	const aboutMe = await getAboutMe();
	if (!repos || !aboutMe) {
		return next(
			new Error('Something went wrong, some of our machinery malfunctioned 🥺')
		);
	}

	res.render('index', {
		title: 'UnnamedXAer',
		repos: repos,
		aboutMe: aboutMe
	});
});

module.exports = router;
