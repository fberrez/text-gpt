const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
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

const History = mongoose.model('History', historySchema);

module.exports = History;
