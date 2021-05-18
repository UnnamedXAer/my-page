var express = require('express');
const { sendEmail } = require('../email/email');
var router = express.Router();
const { getState, getConfig } = require('../state/state');
const { validateContactForm } = require('../validation/contact');
const url = require('url');

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
	const clientIP = req._remoteAddress;
	const reCAPTCHAResponse = req.body['g-recaptcha-response'];
	const { errors, values } = await validateContactForm(
		email,
		subject,
		message,
		reCAPTCHAResponse,
		clientIP
	);

	const data = {
		title: 'UnnamedXAer - Contact',
		errors: errors,
		form: values,
		reCAPTCHAClientKey: getConfig().reCAPTCHAClientKey
	};

	if (Object.keys(errors).length !== 0) {
		data.error = 'Form contains errors, please correct them and submit again.';
		res.render('contact', data);
		return;
	}

	try {
		await sendEmail(values);
	} catch (err) {
		// @todo: send email notification to owner
		data.error =
			'Sorry, we could not send your message due to some problems on the server side, please try again later.';
		res.render('contact', data);
		return;
	}

	let emailParam = '';
	if (email.length > 0) {
		const sp = new url.URLSearchParams({ e: email });
		emailParam = sp.toString();
	}

	res.redirect(`/contact/success?${emailParam}`);
});

router.get('/contact/success', function (req, res, next) {
	const email = req.query['e'];

	const data = {
		title: 'UnnamedXAer - Contact',
		email: email
	};

	res.render('contact-success', data);
});

router.get('/contact*', function (req, res, next) {
	const data = {
		title: 'UnnamedXAer - Contact',
		form: {},
		errors: {},
		error: null,
		reCAPTCHAClientKey: getConfig().reCAPTCHAClientKey
	};

	res.render('contact', data);
});

module.exports = router;
