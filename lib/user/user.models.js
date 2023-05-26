const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	phoneNumber: {
		type: String,
		required: true,
		unique: true,
	},
	subscriptionDate: {
		type: Date,
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
