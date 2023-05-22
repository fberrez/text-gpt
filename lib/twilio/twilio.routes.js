
const controllers = require('./twilio.controllers');

module.exports = server => {
	server.post('/twilio/whatsapp', controllers.whatsapp);
};
