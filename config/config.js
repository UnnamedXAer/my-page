const config = {
	env: process.env['NODE_ENV'],
	reCAPTCHAClientKey: process.env['RECAPTCHA_CLIENT_KEY'],
	reCAPTCHAServerKey: process.env['RECAPTCHA_SERVER_KEY'],
	ownerEmailAddress: process.env['OWNER_EMAIL_ADDRESS'],
	appEmailAddress: process.env['APP_EMAIL_ADDRESS'],
	appEmailPassword: process.env['APP_EMAIL_PASSWORD'],
	smtpHost: process.env['SMTP_HOST'],
	smtpPort: +process.env['SMTP_PORT'],
	mongoUser: process.env['MONGO_USER'],
	mongoPassword: process.env['MONGO_PASSWORD'],
	mongoDB: process.env['MONGO_DATABASE'],
	aboutMeMaxAge: getConfigTimeProp('ABOUT_ME_MAX_AGE'),
	projectsMaxAge: getConfigTimeProp('PROJECTS_MAX_AGE'),
	refreshStateInterval: getConfigTimeProp('REFRESH_STATE_INTERVAL'),
	githubUsername: process.env["GITHUB_NAME"] ,
	logoURL: process.env["LOGO_URL"] ,
};

function getConfigTimeProp(key, envKey) {
	let envValue = process.env[envKey];
	let time = parseInt(envValue, 10);
	if (Number.isFinite(time) && time !== 0) {
		if (time < 0) {
			time = -time;
		}
		return time;
	}
	return 1000 * 60 * 60 * 24;
}

module.exports = config;
