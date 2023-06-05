const moment = require('moment');
const {Configuration, OpenAIApi} = require('openai');
const CONFIG = require('../../config');
const TwilioClient = require('../backend/twilio');
const UserServices = require('../user/user.services');
const HistoryServices = require('../history/history.services');

const configuration = new Configuration({
	apiKey: CONFIG.OPENAI_CHAT_GPT,
});
const openai = new OpenAIApi(configuration);

/**
 * Formats a phone number to be used by Twilio
 * @param {String} phoneNumber Phone number to be formatted
 * @returns {String}
 */
function formatWhatsappNumber(phoneNumber) {
	return phoneNumber.replace('whatsapp:', '');
}

class TwilioServices {
	static async processWhatsAppMessage(from, message) {
		let user = await UserServices.getUserByPhoneNumber(formatWhatsappNumber(from));
		if (!user) {
			user = await this.startCreateUserScenario(from, message);
		}

		if (!await UserServices.userIsValid(user)) {
			return this.sendWhatsAppMessage(from, `You have to subscribe to use this chatbot: ${CONFIG.STRIPE_PAYMENT_LINK}. If you need any help, please send an email to ${CONFIG.CONTACT_EMAIL}.`);
		}

		const histories = await HistoryServices.getHistory(user._id);
		const reply = await this.sendMessageToChatGPT(user, histories.map(({role, content}) => ({role, content})).concat({role: 'user', content: message}));
		await this.sendWhatsAppMessage(from, reply);
	}

	/**
	 * Stats the scenario to create a user
	 * @param {String} phoneNumber User's phone number
	 * @returns {UserModel}
	 */
	static async startCreateUserScenario(phoneNumber, message) {
		console.log(`Creating user with phone number ${phoneNumber}`);
		const user = await UserServices.createUser({phoneNumber: formatWhatsappNumber(phoneNumber)});
		console.log(`User created with phone number ${phoneNumber}, _id: ${user._id}`);
		const reply = await this.sentInitMessageToChatGPT(message);
		await this.sendWhatsAppMessage(phoneNumber, reply);
		return user;
	}

	// Function to send a message to ChatGPT API and get the response
	static async sendMessageToChatGPT(user, messages) {
		let response = '';
		try {
			await HistoryServices.updateHistory({user: user._id, role: messages[messages.length - 1].role, content: messages[messages.length - 1].content, createdAt: moment()});
			console.log('chatgpt\'s request:', messages);
			const completion = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages,
				max_tokens: 2048,
			});
			response = completion.data.choices[0].message.content;
			await HistoryServices.updateHistory({user: user._id, role: 'assistant', content: response, createdAt: moment()});
			console.log('chatgpt\'s response:', response);
		} catch (error) {
			console.error('Error creating completion:', error);
		}

		return response;
	}

	static async sentInitMessageToChatGPT(message) {
		let response = '';
		try {
			console.log('chatgpt\'s request:', message);
			const completion = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [{role: 'system', content: `You're a bot used to in as a whatsapp chatbot. The main objective is too answer questions you receive. But first the first message you send is used to explain what the main goal of the chatbot. You have to explain that the user has 5 free messages to test and then he has to subscribe 5 euros by month. You have to write this first message in the language of the given message : ${message}`}],
				max_tokens: 2048,
			});
			response = completion.data.choices[0].message.content;
			console.log('chatgpt\'s response:', response);
		} catch (error) {
			console.error('Error creating completion:', error);
		}

		return response;
	}

	/**
	 * Sends a message to a WhatsApp number
	 * @param {String} to phone number to send the message
	 * @param {String} message message to send
	 */
	static async sendWhatsAppMessage(to, message) {
		let localTo = to;
		if (!to.includes('whatsapp:')) {
			localTo = `whatsapp:${to}`;
		}

		const substrings = this.splitString(message, 1000);
		try {
			console.log(`[whatsapp:${CONFIG.TWILIO_WHATSAPP_PHONE_NUMBER}] sending message to ${to}: ${message}`);
			for (let i = 0; i < substrings.length; i++) {
				console.log(substrings[i]);
				// eslint-disable-next-line no-await-in-loop
				await TwilioClient.messages.create({
					body: substrings[i],
					from: `whatsapp:${CONFIG.TWILIO_WHATSAPP_PHONE_NUMBER}`,
					to: localTo,
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
