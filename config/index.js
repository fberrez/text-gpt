require('dotenv').config();
const convict = require('convict');

const config = convict({
	ENV: {
		doc: 'The application environment.',
		format: ['production', 'development', 'test'],
		default: 'development',
		env: 'NODE_ENV',
	},
	HOST: {
		doc: 'Server host',
		format: String,
		default: '0.0.0.0',
		env: 'HOST',
	},
	PORT: {
		doc: 'Server port',
		format: Number,
		default: 3000,
		env: 'PORT',
	},
	TWILIO_ACCOUNT_SID: {
		doc: 'Twilio Account SID',
		format: String,
		default: 'xxx',
		env: 'TWILIO_ACCOUNT_SID',
	},
	TWILIO_AUTH_TOKEN: {
		doc: 'Twilio Auth Token',
		format: String,
		default: 'xxx',
		env: 'TWILIO_AUTH_TOKEN',
	},
	TWILIO_WHATSAPP_PHONE_NUMBER: {
		doc: 'Twilio WhatsApp Phone Number',
		format: String,
		default: 'xxx',
		env: 'TWILIO_WHATSAPP_PHONE_NUMBER',
	},
	TWILIO_SMS_PHONE_NUMBER: {
		doc: 'Twilio SMS Phone Number',
		format: String,
		default: 'xxx',
		env: 'TWILIO_SMS_PHONE_NUMBER',
	},
	OPENAI_CHAT_GPT: {
		doc: 'OpenAI Chat GPT',
		format: String,
		default: 'xxx',
		env: 'OPENAI_CHAT_GPT',
	},
	MONGO_URL: {
		doc: 'MongoDB URL',
		format: String,
		default: 'xxx',
		env: 'MONGO_URL',
	},
});

module.exports = {...config.getProperties()};
