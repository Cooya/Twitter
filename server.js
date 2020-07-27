const express = require('express');
const http = require('http');
const io = require('socket.io');
const logger = require('@coya/logger')();

const config = require('./config');
const { onClientConnection } = require('./streaming');

(async () => {
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
