const emailRegexpString = "^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z{|}~])*@[a-zA-Z](-?[a-zA-Z0-9])*(\.[a-zA-Z](-?[a-zA-Z0-9])*)+$";

const emailRegexp = new RegExp(emailRegexpString);

function validateContactForm(email, subject, message) {
	const errors = {};
	const values = {};

	if (typeof email !== 'string') {
		values.email = '';
		errors.email = 'Email address is not correct - expected string';
	} else {
		values.email = email.trim();
		if (!emailRegexp.test(values.email)) {
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

module.exports = {
	validateContactForm
};
