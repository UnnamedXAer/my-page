var express = require('express');
var router = express.Router();
const { getState } = require('../state/state');

const emailRegexpString = `/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/`;

const emailRegexp = new RegExp(emailRegexpString).compile();

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

router.post('/contact/send', function (req, res, next) {
	const { email, subject, message } = req.body;

	const errors = {};

	if (email && !emailRegexp.test(email)) {
		errors.email = 'email is not correct';
	}

	if (!subject) {
		errors.subject = 'subject is required';
	}

	if (!message) {
		errors.message = 'message is required';
	}

	const data = {
		title: 'UnnamedXAer - Contact',
		errors: errors
	};

	console.log(req.body, errors);

	if (Object.keys(errors).length !== 0) {
		data.error = 'form data is not valid';
		res.render('contact', data);
		return;
	}
	res.redirect('/contact/success', 202);
});

router.get('/contact/success', function (req, res, next) {
	const data = {
		title: 'UnnamedXAer - Contact '
	};

	res.render('contact-success', data);
});

router.get('/contact*', function (req, res, next) {
	const data = {
		title: 'UnnamedXAer - Contact'
	};

	res.render('contact', data);
});

module.exports = router;
