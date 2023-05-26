const services = require('./twilio.services');

module.exports = {
	async whatsapp(request, reply) {
		const body = JSON.parse(JSON.stringify(request.body));
		console.log(`whatsapp message received from ${body.From}: ${body.Body}`);

		try {
			await services.processWhatsAppMessage(body.From, body.Body);
		} catch (err) {
			console.error(err);
			reply.send({success: false, error: err.message});
		}

		reply.send({success: true});
	},
};
