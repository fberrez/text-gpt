const controllers = require('./stripe.controllers');

module.exports = server => {
	server.post('/stripe/webhook', {config: {rawBody: true}}, controllers.webhook);
};
