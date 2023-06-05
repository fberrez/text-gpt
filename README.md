# TextGPT (WhatsApp ChatGPT Subscription)

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Welcome to the WhatsApp ChatGPT Subscription project! This repository provides a monthly subscription service that grants users exclusive access to ChatGPT, an advanced AI language model, through WhatsApp.

## Key Features

- **ChatGPT Integration**: Experience the power of ChatGPT's natural language processing capabilities directly on WhatsApp.
- **Real-time Conversations**: Engage in intelligent, contextually relevant conversations with ChatGPT, available 24/7.
- **Seamless WhatsApp Integration**: Access ChatGPT without the need for additional apps or complicated interfaces.

## Getting Started

```sh
$ npm install

$ npm run debug
```

## Configuration

The project requires a `.env` file to be created in the root directory. This file should contain the following environment variables:

- `PORT`: The port number that the project will run on.
- `TWILIO_ACCOUNT_SID`: The account SID for the Twilio account.
- `TWILIO_AUTH_TOKEN`: The auth token for the Twilio account.
- `TWILIO_WHATSAPP_PHONE_NUMBER`: The phone number for the Twilio account.
- `OPENAI_CHAT_GPT`: The API key for the OpenAI API.
- `MONGO_URL`: The URL for the MongoDB database.
- `STRIPE_PAYMENT_LINK`: The URL for the Stripe payment link.
- `STRIPE_SIGNING_SECERT`: The signing secret for the Stripe account, used to verify webhooks.
- `CONTACT_EMAIL`: The email address that users can contact for support. (optional)

Here is an example `.env` file:

```sh
HOST=0.0.0.0
PORT=3000
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_PHONE_NUMBER=+1234567890
OPENAI_CHAT_GPT=sk-xxxx
MONGO_URL=mongodb://localhost:27017
STRIPE_PAYMENT_LINK=https://buy.stripe.com/xxxx
STRIPE_SIGNING_SECRET=whsec_xxxx
CONTACT_EMAIL=support@gmail.com
```

## Usage

The project contains two post routes that serve as webhooks for Stripe and Twilio.
These webhooks allow the project to receive and process data from Stripe and Twilio respectively.

- The Stripe webhook is used to handle subscription payments and updates: `POST /stripe/webhook` ([stripe.routes.js](./lib/stripe/stripe.routes.js))
- The Twilio webhook is used to handle incoming messages and send responses: `POST /twilio/whatsapp` ([twilio.routes.js](./lib/twilio/twilio.routes.js))

The webhooks are essential to the project's functionality, as they allow for seamless integration with Stripe and Twilio and enable the project to provide its core features.

## Requirements

- Valid Twilio account
- Valid WhatsApp account
- Valid Stripe account
- Access to OpenAI API

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

