const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	phoneNumber: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
	},
	email: {
		type: String,
		unique: true,
	},
	stripeCustomerId: String, // Stripe's customer id
	stripeSubscriptionId: String, // Stripe's subscription id
	subscriptionStatus: {
		type: String,
		enum: ['inactive', 'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'],
		default: 'inactive',
	},
	subscriptionEndDate: Date,
	subscriptionCancelAtPeriodEnd: {type: Boolean, default: false},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
