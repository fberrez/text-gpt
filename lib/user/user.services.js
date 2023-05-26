const moment = require('moment');

const UserModel = require('./user.models');
const HistoryModel = require('../history/history.models');
const TwilioService = require('../twilio/twilio.services');

class UserServices {
	/**
	 * Gets a user by his phone number
	 * @param {String} phoneNumber User's phone number
	 * @returns {UserModel}
	 */
	static async getUserByPhoneNumber(phoneNumber) {
		const user = UserModel.findOne({phoneNumber});
		if (user) {
			return user;
		}

		return this.startCreateUserScenario(phoneNumber);
	}

	/**
	 * Stats the scenario to create a user
	 * @param {String} phoneNumber User's phone number
	 * @returns {UserModel}
	 */
	static async startCreateUserScenario(phoneNumber) {
		const user = await UserModel.create({phoneNumber});

		TwilioService.sendWhatsAppMessage(phoneNumber, [{role: 'system', content: `You're a bot used to in as a whatsapp chatbot. The main objective is too answer questions you receive. But first the first message you send is used to explain what the main goal of the chatbot. You have to explain that the user has 5 free messages to test and then he has to subscribe 5 euros by month. You have to write this first message in the language of the given phone number : ${phoneNumber}`}]);
		return user;
	}

	/**
	 * Checks if a user is valid. A user is valid if he has less than 5 messages in the history or if he is subscribed.
	 * @param {Object} user user object
	 * @returns {Boolean}
	 */
	static async userIsValid(user) {
		const docCount = await HistoryModel.count({user: user._id, role: 'user'});
		if (docCount < 5) {
			return true;
		}

		const isUserSubscribed = await this.isUserSubscribed(user);
		if (isUserSubscribed) {
			return true;
		}

		return false;
	}

	/**
	 * Checks if a user is subscribed. A user is subscribed if he has a moment(user.subscriptionDate) and if this date is less than 1 month ago.
	 * @param {Object} user user object
	 * @returns {Boolean} true if the user is subscribed, false otherwise
	 */
	static async isUserSubscribed(user) {
		return moment().diff(moment(user.moment(user.subscriptionDate)), 'month') < 1;
	}
}

module.exports = UserServices;
