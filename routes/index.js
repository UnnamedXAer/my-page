var express = require('express');
var router = express.Router();
const { getState } = require('../state/state');

router.get('/', function (req, res, next) {
	const state = getState();

	const data = {
		title: 'UnnamedXAer',
		repos: state.projects.repos,
		socials: state.socials,
		aboutMe: state.aboutMe.text,
		logoURL: state.logoURL,
		githubUsername: state.githubUsername
	};

	res.render('index', data);
});

module.exports = router;
