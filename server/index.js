const express = require('express');
const http = require('http');
const io = require('socket.io');
const logger = require('@coya/logger')();

const config = require('../config');
const controllers = require('./controllers');
const dbConnection = require('./database_connection');
const streaming = require('./streaming');
// const { startStreaming, endStreaming } = require('./twitter_api/streaming_api');
const { startStreaming, endStreaming, isStreaming } = require('./twitter_api/polling_api');

(async () => {
	// initialize the streaming service
	const onClientConnection = streaming(startStreaming, endStreaming, isStreaming, controllers);

	// database connection
	await dbConnection.connect();

	// web server
	const app = express();
	app.use('/', express.static(config.webInterfaceBuildFolder || './build'));

	// socket server
	const server = http.Server(app); // wrap express app in a http server
	const socketServer = io(server); // add socket.io to the http server
	socketServer.of('twitter').on('connection', onClientConnection); // define socket server callback whenever a client is connected

	// port listening
	const port = config.port || 8080;
	server.listen(port, () => {
		logger.info('Server listening on port ' + port + '.');
	});
})();
