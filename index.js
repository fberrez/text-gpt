const config = require('./config');
const server = require('./lib/server');
const mongoose = require('./lib/backend/mongo');

async function main() {
	await mongoose.connect(config.MONGO_URL);
	server.listen({port: config.PORT, host: config.HOST}, (err, address) => {
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
	await server.close();
	console.log('HTTP server closed');
	process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

main();

