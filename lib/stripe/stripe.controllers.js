const moment = require('moment');

const CONFIG = require('../../config');
const TwilioServices = require('../twilio/twilio.services');
const StripeServices = require('./stripe.services');

const stripe = require('stripe')(CONFIG.STRIPE_SECRET_KEY);

module.exports = {
	async webhook(req, res) {
		const sig = req.headers['stripe-signature'];

		let event;
		try {
			event = stripe.webhooks.constructEvent(req.rawBody, sig, CONFIG.STRIPE_SIGNING_SECERT);
		} catch (err) {
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}

		// Handle the event
		switch (event.type) {
			case 'customer.created': {
				console.log(`customer creating: ${event.data.object.id}`);
				const user = await StripeServices.createCustomer(event.data.object.id, event.data.object.phone, event.data.object.email, event.data.object.name);
				console.log(`customer created ${event.data.object.id} with user id ${user._id}`);
				break;
			}

			case 'customer.subscription.created': {
				console.log(`customer subscription creating: ${event.data.object.id}`);
				const user = await StripeServices.setSubscription(event.data.object.customer, event.data.object.id, event.data.object.status, event.data.object.current_period_end);
				console.log(`customer subscription created ${event.data.object.id} for user ${user._id}`);
				break;
			}

			case 'customer.subscription.updated': {
				console.log(`customer subscription updating: ${event.data.object.id}`);
				const user = await StripeServices.setSubscriptionStatus(event.data.object.id, event.data.object.status, event.data.object.current_period_end);
				console.log(`customer subscription updated ${event.data.object.id} for user ${user._id}`);
				break;
			}

			case 'invoice.paid': {
				console.log(`invoice paid: ${event.data.object.id}`);
				const user = await StripeServices.setSubscriptionStatus(event.data.object.subscription, 'active', event.data.object.lines.data[0].period.end);
				if (user.phoneNumber && user.subscriptionEndDate) {
					await TwilioServices.sendWhatsAppMessage(user.phoneNumber, `Thank you! Your subscription has been created. Your subscription runs until ${moment(user.subscriptionEndDate).format('DD MMMM YYYY')}. You can cancel it at anytime by clicking on the link you've received by email. For any help, here is your previlegied contact: ${CONFIG.CONTACT_EMAIL}`);
				}

				console.log(`invoice paid ${event.data.object.id} for user ${user._id}`);
				break;
			}

			case 'customer.subscription.deleted': {
				console.log(`customer subscription deleting: ${event.data.object.id}`);
				const user = await StripeServices.cancelSubscription(event.data.object.id);
				if (user.phoneNumber) {
					await TwilioServices.sendWhatsAppMessage(user.phoneNumber, `Thank you! Your subscription has been created. Your subscription runs until ${moment(user.subscriptionEndDate).format('DD MMMM YYYY')}. You can cancel it at anytime by clicking on the link you've received by email (from stripe). For any help, here is your previlegied contact: ${CONFIG.CONTACT_EMAIL}`);
				}

				console.log(`customer subscription deleted ${event.data.object.id}`);
				break;
			}

			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		// Return a 200 res to acknowledge receipt of the event
		res.send();
	},

};
