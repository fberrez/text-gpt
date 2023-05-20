const config = require('./config');
const client = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
const {Configuration, OpenAIApi} = require('openai');
const fformbody = require('@fastify/formbody');

// Function to send a WhatsApp message
async function sendWhatsAppMessage(to, message) {
	try {
		const result = await client.messages.create({
			body: message,
			from: `whatsapp:${config.TWILIO_WHATSAPP_PHONE_NUMBER}`, // Your sandbox phone number
			to,
		});
		console.log('Message sent:', result.sid);
	} catch (error) {
		console.error('Error sending message:', error);
	}
}

// Function to send a message to ChatGPT API and get the response
async function sendMessageToChatGPT(message) {
	const configuration = new Configuration({
		apiKey: config.OPENAI_CHAT_GPT,
	});
	const openai = new OpenAIApi(configuration);

	try {
		const completion = await openai.createChatCompletion({
			model: 'text-davinci-003',
			prompt: message,
			max_tokens: 2048,
		});
		console.log('chatgpt\'s response', completion.data.choices[0].text);
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

fastify.register(fformbody);

// Route handler for POST /twilio
fastify.post('/twilio', async (request, reply) => {
	const body = JSON.parse(JSON.stringify(request.body));
	console.log(`message received from ${body.From}: ${body.Body}`);

	processWhatsAppMessage(body.From, body.Body);
	reply.send({success: true});
});

fastify.listen({port: config.PORT, host: config.HOST}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	console.log(`Server listening at ${address}`);
});

