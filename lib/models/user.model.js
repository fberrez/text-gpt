const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	phoneNumber: {
		type: String,
		required: true,
		unique: true,
	},
	subscriptionValidationDate: {
		type: Date,
		required: true,
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
