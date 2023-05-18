const config = require('./config');
const client = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
const {Configuration, OpenAIApi} = require('openai');
const xmlBodyParser = require('fastify-xml-body-parser');
const multipart = require('fastify-multipart');

// Function to send a WhatsApp message
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

// Function to send a message to ChatGPT API and get the response
async function sendMessageToChatGPT(message) {
	const configuration = new Configuration({
		apiKey: config.CHATGPT_API_KEY,
	});
	const openai = new OpenAIApi(configuration);

	try {
		const completion = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: message,
		});
		return completion.data.choices[0].text;
	} catch (error) {
		console.error('Error creating completion:', error);
	}

	return '';
}

// Usage example
async function processWhatsAppMessage(from, message) {
	const reply = await sendMessageToChatGPT(message);
	sendWhatsAppMessage(from, reply);
}

const fastify = require('fastify')();

fastify.register(xmlBodyParser);
fastify.register(multipart);

// Route handler for POST /twilio
fastify.post('/twilio', async (request, reply) => {
	const parts = request.parts();

	console.log(parts);

	// Iterate over the FormData parts
	let phoneNumber = '';
	let message = '';
	for await (const part of parts) {
		if (part.fieldname === 'phoneNumber') {
			phoneNumber = await part.toString();
			// Handle phoneNumber value
		} else if (part.fieldname === 'message') {
			message = await part.toString();
			// Handle message value
		} else {
			// Handle other FormData fields if needed
		}
	}

	processWhatsAppMessage(phoneNumber, message);
	reply.send({success: true});
});

fastify.listen({port: config.PORT, host: config.HOST}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	console.log(`Server listening at ${address}`);
});

