const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	role: {
		type: String,
		required: true,
		enum: ['system', 'user', 'assistant'],
	},
	content: {
		type: String,
		required: true,
	},
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
