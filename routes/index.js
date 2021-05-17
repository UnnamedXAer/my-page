var express = require('express');
const { sendEmail } = require('../email/email');
var router = express.Router();
const { getState } = require('../state/state');
const { validateContactForm } = require('../validation/contact');

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

router.post('/contact', async function (req, res, next) {
	const contentType = req.headers['content-type'];

	if (!contentType || !contentType.includes('application/x-www-form-urlencoded')) {
		return next(new Error('Invalid "content-type"'));
	}

	const { email, subject, message } = req.body;
	const { errors, values } = validateContactForm(email, subject, message);

	const data = {
		title: 'UnnamedXAer - Contact',
		errors: errors,
		form: values
	};

	if (Object.keys(errors).length !== 0) {
		data.error = 'Form contains errors, please correct them and submit again.';
		res.render('contact', data);
		return;
	}

	try {
		await sendEmail(values.email, values.subject, values.message);
	} catch (err) {
		if (err.code === 'INTERNAL') {
			data.error =
				'Sorry, we could not send your message due to some problems on the server side, please try again later.';
			res.render('contact', data);
			return;
		}
	}

	res.redirect('/contact/thank-you');
});

router.get('/contact/thank-you', function (req, res, next) {
	const data = {
		title: 'UnnamedXAer - Contact -thanks'
	};

	res.render('contact-success', data);
});

router.get('/contact*', function (req, res, next) {
	const data = {
		title: 'UnnamedXAer - Contact',
		form: {},
		errors: {},
		error: null
	};

	res.render('contact', data);
});

module.exports = router;
