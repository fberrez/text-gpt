const CONFIG = require('./config');
const {fastify, init: fastifyInit} = require('./lib/server');
const mongoose = require('./lib/backend/mongo');

async function main() {
	await mongoose.connect(CONFIG.MONGO_URL);
	await fastifyInit();
	fastify.listen({port: CONFIG.PORT, host: CONFIG.HOST}, (err, address) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}

		console.log(`Server listening at ${address}`);
	});
}

async function shutdown() {
	console.log('SIGTERM signal received: closing HTTP server and mongoDB connection');
	await mongoose.disconnect();
	await fastify.close();
	console.log('HTTP server closed');
	process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

main();

