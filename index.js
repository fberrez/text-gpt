const config = require('./config');
const client = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
const {Configuration, OpenAIApi} = require('openai');
const fformbody = require('@fastify/formbody');

function splitString(str, maxLength) {
	const substrings = [];
	let start = 0;

	while (start < str.length) {
		let end = start + maxLength;
		if (end >= str.length) {
			end = str.length;
		} else {
			while (str.charAt(end) !== ' ' && end > start) {
				end--;
			}

			while (!['.', '!', '?'].includes(str.charAt(end - 1)) && end > start) {
				end--;
			}
		}

		substrings.push(str.substring(start, end));
		start = end + 1;
	}

	return substrings;
}

// Function to send a WhatsApp message
async function sendWhatsAppMessage(to, message) {
	const substrings = splitString(message, 1000);
	try {
		console.log(`[whatsapp:${config.TWILIO_WHATSAPP_PHONE_NUMBER}] sending message to ${to}: ${message}`);
		for (let i = 0; i < substrings.length; i++) {
			console.log(substrings[i]);
			await client.messages.create({
				body: substrings[i],
				from: `whatsapp:${config.TWILIO_WHATSAPP_PHONE_NUMBER}`, // Your sandbox phone number
				to,
			});
		}
	} catch (error) {
		console.error('Error sending message:', error);
	}
}

// Function to send a WhatsApp message
async function sendSMSMessage(to, message) {
	try {
		console.log(`[${config.TWILIO_SMS_PHONE_NUMBER}] sending message to ${to}: ${message}`);
		const result = await client.messages.create({
			body: message.length > 0 ? message : 'No message provided',
			from: `${config.TWILIO_SMS_PHONE_NUMBER}`, // Your sandbox phone number
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

	let response = '';
	try {
		console.log('chatgpt\'s request:', message);
		const completion = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt: message,
			max_tokens: 2048,
		});
		response = completion.data.choices[0].text;
		console.log('chatgpt\'s response:', response);
	} catch (error) {
		console.error('Error creating completion:', error.response.data?.error);
	}

	return response;
}

// Usage example
async function processWhatsAppMessage(from, message) {
	const reply = await sendMessageToChatGPT(message);
	await sendWhatsAppMessage(from, reply);
}

async function processSMSMessage(from, message) {
	const reply = await sendMessageToChatGPT(message);
	await sendSMSMessage(from, reply);
}

const fastify = require('fastify')();

fastify.register(fformbody);

// Route handler for POST /twilio
fastify.post('/twilio/whatsapp', async (request, reply) => {
	const body = JSON.parse(JSON.stringify(request.body));
	console.log(`whatsapp message received from ${body.From}: ${body.Body}`);

	await processWhatsAppMessage(body.From, body.Body);
	reply.send({success: true});
});

fastify.post('/twilio/sms', async (request, reply) => {
	const body = JSON.parse(JSON.stringify(request.body));
	console.log(`sms received from ${body.From}: ${body.Body}`);

	await processSMSMessage(body.From, body.Body);
	reply.send({success: true});
});

fastify.listen({port: config.PORT, host: config.HOST}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	console.log(`Server listening at ${address}`);
});

