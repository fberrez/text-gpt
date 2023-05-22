const fastify = require('fastify')();
const fformbody = require('@fastify/formbody');

const router = require('./server.routes');

fastify.register(fformbody);
router(fastify);

module.exports = fastify;
