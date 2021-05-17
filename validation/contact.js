const { default: axios } = require('axios');
const url = require('url');
const { getConfig } = require('../state/state');

const emailRegexpString =
	"^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](.?[-!#$%&'*+/0-9=?A-Z^_a-z{|}~])*@[a-zA-Z](-?[a-zA-Z0-9])*(.[a-zA-Z](-?[a-zA-Z0-9])*)+$";

const emailRegexp = new RegExp(emailRegexpString);

async function validateContactForm(email, subject, message, reCAPTCHAResponse, remoteIP) {
	const errors = {};
	const values = {};

	if (!(await validateReCAPTCHA(reCAPTCHAResponse, remoteIP))) {
		errors.reCAPTCHA = 'Error verifying reCAPTCHA, please try again.';
	}

	if (typeof email !== 'string') {
		values.email = '';
		errors.email = 'Email address is not correct - expected string';
	} else {
		values.email = email.trim();
		if (email.length > 0 && !emailRegexp.test(values.email)) {
			errors.email =
				'Please enter your email address in format: yourname@example.com';
		}
	}

	if (typeof subject !== 'string') {
		values.subject = '';
		errors.subject = 'Subject is not correct - expected string';
	} else {
		values.subject = subject.trim();
		if (values.subject.length > 100) {
			errors.subject = 'Subject max allowed length is 100 characters';
		}
	}

	if (typeof message !== 'string') {
		values.message = '';
		errors.message = 'Subject is not correct - expected string';
	} else {
		values.message = message.trim();
		if (values.message.length < 10) {
			errors.message =
				'Minimum 10 characters is required - please type at least one sentence';
		} else if (values.message.length > 1000) {
			errors.message = 'Message max allowed length is 1000 characters';
		}
	}

	return { errors, values };
}

async function validateReCAPTCHA(reCAPTCHAResponse, remoteIP) {
	if (typeof reCAPTCHAResponse !== 'string' || reCAPTCHAResponse.length === 0) {
		return false;
	}

	const config = getConfig();
	const verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
	const payload = {
		secret: config.reCAPTCHAServerKey,
		response: reCAPTCHAResponse,
		remoteip: remoteIP
	};
	const sp = new url.URLSearchParams(payload);
	const params = sp.toString();

	try {
		const { data } = await axios.post(verifyURL, params);

		if (!data.success) {
			console.log(
				new Date().toUTCString(),
				`reCAPTCHA: removeIP: (${remoteIP}),  `,
				data
			);
		}
		return data.success;
	} catch (err) {
		console.error(
			new Date().toUTCString(),
			`reCAPTCHA: removeIP: (${remoteIP}),  `,
			err
		);
		return false + (config.env === 'production' ? '' : ': ' + err.toString());
	}
}

module.exports = {
	validateContactForm
};
