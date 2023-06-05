const moment = require('moment');

const UserModel = require('./user.models');
const HistoryModel = require('../history/history.models');

class UserServices {
	/**
	 * Gets a user by his phone number
	 * @param {String} phoneNumber User's phone number
	 * @returns {UserModel}
	 */
	static async getUserByPhoneNumber(phoneNumber) {
		return UserModel.findOne({phoneNumber});
	}

	/**
	 * Gets a user by his stripe customer id
	 * @param {String} stripeCustomerId Stripe customer id
	 * @returns {UserModel}
	 */
	static async getUserByStripeCustomerId(stripeCustomerId) {
		return UserModel.findOne({stripeCustomerId});
	}

	/**
	 * Gets a user by his stripe subscription id
	 * @param {String} stripeSubscriptionId Stripe subscription id
	 * @returns {UserModel}
	 */
	static async getUserByStripeSubscriptionId(stripeSubscriptionId) {
		return UserModel.findOne({stripeSubscriptionId});
	}

	/**
	 * Creates a user
	 * @param {String} phoneNumber User's phone number
	 * @returns {UserModel}
	 */
	static async createUser({stripeCustomerId, phoneNumber, email, name}) {
		const user = await UserModel.create({stripeCustomerId, phoneNumber, email, name});
		return user;
	}

	/**
	 * Sets the stripe customer id of a user
	 * @param {Object} user user object
	 * @param {String} stripeCustomerId Stripe customer id
	 */
	static async setStripeCustomerId(user, stripeCustomerId) {
		user.stripeCustomerId = stripeCustomerId;
		await user.save();
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
		if (user.subscriptionDate === undefined || ['inactive', 'canceled', 'unpaid'].includes(user.subscriptionStatus)) {
			return false;
		}

		return moment().diff(moment(user.subscriptionDate), 'month') < 1;
	}
}

module.exports = UserServices;
