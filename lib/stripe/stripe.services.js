const moment = require('moment');
const UserService = require('../user/user.services');

class StripeServices {
	/**
   * Creates a customer in the database if he doesn't exist, or updates his stripe customer id if he exists
   * @param {String} stripeCustomerId Stripe customer id
   * @param {String} phoneNumber User's phone number
   * @param {String} email User's email
   * @param {String} name User's name
   * @returns {UserModel} user
   */
	static async createCustomer(stripeCustomerId, phoneNumber, email, name) {
		const user = await UserService.getUserByPhoneNumber(phoneNumber);
		if (!user) {
			// Create a new user
			return UserService.createUser({stripeCustomerId, phoneNumber, email, name});
		}

		// Set the stripe customer id of the user
		return UserService.setStripeCustomerId(user, stripeCustomerId);
	}

	/**
   * Sets the stripe subscription id to a user
   * @param {Object} stripeCustomerId Stripe customer id
   * @param {String} stripeSubscriptionId Stripe subscription id
   * @param {String} stripeSubscriptionStatus Subscription status
   * @param {Number} stripeSubscriptionEndDate Subscription end date
   * @returns {UserModel} user
   */
	static async setSubscription(stripeCustomerId, stripeSubscriptionId, stripeSubscriptionStatus, stripeSubscriptionEndDate) {
		const user = await UserService.getUserByStripeCustomerId(stripeCustomerId);
		if (!user) {
			throw new Error(`User not found with this stripe customer id ${stripeCustomerId}`);
		}

		user.stripeSubscriptionId = stripeSubscriptionId;
		user.subscriptionStatus = stripeSubscriptionStatus;
		user.subscriptionEndDate = moment.unix(stripeSubscriptionEndDate);
		await user.save();
		return user;
	}

	/**
   * Sets the subscription status and end date of a user
   * @param {String} stripeSubscriptionId Stripe subscription id
   * @param {String} stripeSubscriptionStatus Subscription status
   * @param {Number} stripeSubscriptionEndDate Subscription end date
   * @returns {UserModel} user
   */
	static async setSubscriptionStatus(stripeSubscriptionId, stripeSubscriptionStatus, stripeSubscriptionEndDate) {
		const user = await UserService.getUserByStripeSubscriptionId(stripeSubscriptionId);
		if (!user) {
			throw new Error(`User not found with this stripe subscription id ${stripeSubscriptionId}`);
		}

		user.subscriptionStatus = stripeSubscriptionStatus;
		user.subscriptionEndDate = moment.unix(stripeSubscriptionEndDate);
		await user.save();
		return user;
	}

	/**
   * Cancels the subscription of a user
   * @param {String} stripeSubscriptionId Stripe subscription id
   * @returns {UserModel} user
   */
	static async cancelSubscription(stripeSubscriptionId) {
		const user = await UserService.getUserByStripeSubscriptionId(stripeSubscriptionId);
		if (!user) {
			throw new Error(`User not found with this stripe subscription id ${stripeSubscriptionId}`);
		}

		user.subscriptionStatus = 'canceled';
		user.subscriptionCancelAtPeriodEnd = true;
		await user.save();
		return user;
	}
}

module.exports = StripeServices;
