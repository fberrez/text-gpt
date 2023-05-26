const mongoose = require('mongoose');

mongoose.connection.on('error', err => {
	console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('connected', () => {
	console.log('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
	console.log('MongoDB disconnected');
});

module.exports = mongoose;

