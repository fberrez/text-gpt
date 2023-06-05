const CONFIG = require('../../config');
const client = require('twilio')(CONFIG.TWILIO_ACCOUNT_SID, CONFIG.TWILIO_AUTH_TOKEN);

module.exports = client;
