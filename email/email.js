const nodemailer = require('nodemailer');
const { default: validator } = require('validator');
const { getConfig } = require('../state/state');

async function sendEmail(data) {
	const config = getConfig();
	const sanitizedData = sanitizeEmailPayload(data);

	const transporter = nodemailer.createTransport({
		host: config.smtpHost,
		port: config.smtpPort,
		auth: {
			user: config.emailAddress,
			pass: config.emailPassword
		}
	});

	const content = generateEmailContent(sanitizedData);

	const mailOptions = {
		from: sanitizedData.email
			? sanitizedData.email
			: `"server" <${config.emailAddress}>`,
		to: config.emailAddress,
		subject: 'portfolio contact form',
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
		`${email ? email : 'anonymous'} sent you following message:`,
		'',
		`Subject: ${subject ? subject : '>no_subject<'}`,
		'',
		'Message:',
		message,
		'',
		`at: ${new Date().toUTCString()}`
	].join();

	const html = [
		`<p>${email ? email : '>anonymous<'} sent you following message:</p>`,
		`<h3>Subject: ${subject ? subject : '>no_subject<'}</h3>`,
		`<b>Message:</b>`,
		`<p>${message}</p>`,
		'',
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
