const twilio = require('../twilio/twilio.routes');

module.exports = server => {
	twilio(server);
};
