const twilio = require('../twilio/twilio.routes');
const stripe = require('../stripe/stripe.routes');

module.exports = server => {
	twilio(server);
	stripe(server);
};
