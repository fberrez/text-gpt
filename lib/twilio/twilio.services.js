const {Configuration, OpenAIApi} = require('openai');
const config = require('../../config');
const TwilioClient = require('../backend/twilio');

class TwilioServices {
	static async processWhatsAppMessage(from, message) {
		const reply = await this.sendMessageToChatGPT(message);
		await this.sendWhatsAppMessage(from, reply);
	}

	// Function to send a message to ChatGPT API and get the response
	static async sendMessageToChatGPT(message) {
		const configuration = new Configuration({
			apiKey: config.OPENAI_CHAT_GPT,
		});
		const openai = new OpenAIApi(configuration);

		let response = '';
		try {
			console.log('chatgpt\'s request:', message);
			const completion = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [{role: 'user', content: message}],
				max_tokens: 2048,
			});
			response = completion.data.choices[0].message.content;
			console.log('chatgpt\'s response:', response);
		} catch (error) {
			console.error('Error creating completion:', error.response.data?.error);
		}

		return response;
	}

	// Function to send a WhatsApp message
	static async sendWhatsAppMessage(to, message) {
		const substrings = this.splitString(message, 1000);
		try {
			console.log(`[whatsapp:${config.TWILIO_WHATSAPP_PHONE_NUMBER}] sending message to ${to}: ${message}`);
			for (let i = 0; i < substrings.length; i++) {
				console.log(substrings[i]);
				// eslint-disable-next-line no-await-in-loop
				await TwilioClient.messages.create({
					body: substrings[i],
					from: `whatsapp:${config.TWILIO_WHATSAPP_PHONE_NUMBER}`,
					to,
				});
			}
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}

	static splitString(str, maxLength) {
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
}

module.exports = TwilioServices;
