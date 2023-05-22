const services = require('./twilio.services');

module.exports = {
	async whatsapp(request, reply) {
		const body = JSON.parse(JSON.stringify(request.body));
		console.log(`whatsapp message received from ${body.From}: ${body.Body}`);

		await services.processWhatsAppMessage(body.From, body.Body);
		reply.send({success: true});
	},
};
