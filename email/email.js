const nodemailer = require('nodemailer');
const { default: validator } = require('validator');
const config = require('../config/config');

async function sendEmail(data) {
	const sanitizedData = sanitizeEmailPayload(data);

	const transporter = nodemailer.createTransport({
		host: config.smtpHost,
		port: config.smtpPort,
		auth: {
			user: config.appEmailAddress,
			pass: config.appEmailPassword
		}
	});

	const content = generateEmailContent(sanitizedData);

	// @i: the "from" property do not work with custom email address,
	// @i: the mail always comes from email used in transporter
	const mailOptions = {
		from: `"portfolio server" <${config.appEmailAddress}>`,
		to: config.ownerEmailAddress ? config.ownerEmailAddress : config.appEmailAddress,
		subject: 'Message from your portfolio web app.',
		text: content.text,
		html: content.html
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log(new Date().toUTCString(), 'send email', info);
	} catch (err) {
		console.error(new Date().toUTCString(), 'send email: ', mailOptions, err);
		throw err;
	}
}

function sanitizeEmailPayload(data) {
	return {
		email: data.email ? validator.normalizeEmail(data.email) : '',
		subject: validator.escape(data.subject),
		message: validator.escape(data.message)
	};
}

function generateEmailContent(data) {
	const { email, subject, message } = data;
	const text = [
		`${email ? email : 'Anonymous user'} sent you following message:`,
		'',
		`Subject: ${subject ? subject : '>no_subject<'}`,
		'',
		'Content:',
		message,
		'',
		'_____________________________________________',
		`at: ${new Date().toUTCString()}`
	].join();

	const html = [
		`<p>${
			email
				? `<a href="mailto:${email}?subject=RE: ${subject}" >${email}</a>`
				: 'Anonymous user'
		} sent you following message:</p>`,
		`<h3>Subject: ${subject ? subject : '>no_subject<'}</h3>`,
		`<b>Content:</b>`,
		`<p>${message}</p>`,
		'',
		'<hr />',
		`at: ${new Date().toUTCString()}`
	].join('<br>');

	return {
		text,
		html
	};
}

module.exports = {
	sendEmail
};
