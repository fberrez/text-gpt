const config = require('./config');
const client = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
const {Configuration, OpenAIApi} = require('openai');
const winston = require('winston');

// Function to send a WhatsApp message
async function sendWhatsAppMessage(to, message) {
	try {
		const result = await client.messages.create({
			body: message,
			from: 'whatsapp:+14155238886', // Your sandbox phone number
			to: `whatsapp:${to}`,
		});
		winston.log(`message ${message}`);
		winston.log('Message sent:', result.sid);
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

// Route handler for POST /twilio
fastify.post('/twilio', (request, reply) => {
	winston.log(request.body);
	winston.log(request.query);
	winston.log(request.params);
	// Assuming you want to receive JSON data in the request body
	const {phoneNumber, message} = request.body;
	winston.log(JSON.stringify(request.body, '  ', 2));
	processWhatsAppMessage(phoneNumber, message);
	reply.send({success: true});
});

fastify.listen({port: config.PORT, host: config.HOST}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	winston.log(`Server listening at ${address}`);
});

