const config = require('./config');
const client = require('twilio')('AC8cbecb2b44ab05d0c41ced281876f7a7', '9fad1d4bdae1e718afe3bf2de6d11e4b');

async function sendWhatsAppMessage(to, message) {
	try {
		const result = await client.messages.create({
			body: message,
			from: 'whatsapp:+14155238886', // Your sandbox phone number
			to: `whatsapp:${to}`,
		});
		console.log(`message ${message}`);
		console.log('Message sent:', result.sid);
	} catch (error) {
		console.error('Error sending message:', error);
	}
}

sendWhatsAppMessage('+33620202439', 'Hello World!');
