const express = require('express');
const http = require('http');
const logger = require('@coya/logger')();
const io = require('socket.io');
const Twitter = require('twitter');

const config = require('./config');
const webhook = require('./webhook');

// instantiate twitter client
const twitter = new Twitter({
	consumer_key: config.consumerKey,
	consumer_secret: config.consumerSecret,
	access_token_key: config.accessTokenKey,
	access_token_secret: config.accessTokenSecret
});

// instantiate web server
const app = express();
app.use('/', express.static(config.webInterfaceBuildFolder));
webhook(app, twitter);

const server = http.Server(app); // wrap express app in a http server
const socketServer = io(server); // add socket.io to the http server
server.listen(config.port, () => { // launch the http server
	logger.info('Server listening on port ' + config.port + '.');
});

// define socket server callbacks
socketServer.of('twitter').on('connection', socketClient => {
	logger.info('Twitter socket client connected.');

	socketClient.on('streamingRequest', (request, callback) => {
		logger.info('New streaming request received.');
		startStreaming(socketClient, request);
		callback('ok');
	});

	socketClient.on('stopStreaming', callback => {
		logger.info('Stop streaming request received.');
		if (socketClient.stream) {
			endStreaming(socketClient);
			callback('ok');
		} else callback('There is no streaming in progress.');
	});

	socketClient.on('disconnect', () => {
		logger.info('Socket client disconnected.');
		endStreaming(socketClient);
	});

	socketClient.on('error', error => {
		logger.error(error);
	});
});

function startStreaming(socket, request) {
	logger.info('Starting streaming...');

	socket.stream = twitter.stream('statuses/filter', { track: request, language: 'fr' });

	socket.stream.on('data', data => {
		const status = data.retweeted_status ? data.retweeted_status : data;
		const content = status.extended_tweet ? status.extended_tweet.full_text : status.text;

		if (socket.disconnected)
			return endStreaming(socket);

		logger.info('Emitting new tweet (' + status.id_str + ')...');
		socket.emit('tweet', {
			id: status.id_str,
			content: content
		});
	});

	socket.stream.on('error', error => {
		if(error.message == 'Status Code: 420') {
			logger.error('Too much streaming at the same time.');
			socket.emit('stream_error', 'Too much streaming at the same time.');
		} else logger.error(error);
	});

	socket.stream.on('end', () => {
		endStreaming(socket);
	});
}

function endStreaming(socketClient) {
	if(!socketClient.stream) return;
	socketClient.stream.destroy();
	socketClient.stream = null;
	logger.info('End of stream.');
}