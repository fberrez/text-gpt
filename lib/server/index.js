const fastify = require('fastify')({logger: true});
const fformbody = require('@fastify/formbody');
const frawbody = require('fastify-raw-body');

const router = require('./server.routes');

async function init() {
	await fastify.register(fformbody);
	await fastify.register(frawbody);
	router(fastify);
}

module.exports = {fastify, init};
