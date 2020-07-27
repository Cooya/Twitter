const axios = require('axios');
const logger = require('@coya/logger')();

const config = require('./config');
const { replyToTweet } = require('./twitter_methods');

function onClientConnection(socketClient) {
	logger.info('Twitter socket client connected.');

	socketClient.on('streamingRequest', (request, callback) => {
		logger.info('New streaming request received.');
		startStreaming(socketClient, request)
		.then(() => callback('ok'))
		.catch(error => {
			logger.error(error);
			callback(error.message);
		});
	});

	socketClient.on('stopStreaming', callback => {
		logger.info('Stop streaming request received.');
		if (socketClient.stream) {
			endStreaming(socketClient);
			callback('ok');
		} else callback('There is no streaming in progress.');
	});

	socketClient.on('replyToTweet', (tweetId, callback) => {
		logger.info('Reply to tweet request received.');
		replyToTweet(tweetId, config.replyMessage)
		.then(() => {
			logger.info('Tweet reply submitted successfully.');
			callback('ok');
		}, e => {
			logger.error(e.message);
			callback(e.message);
		});
	});

	socketClient.on('disconnect', () => {
		logger.info('Socket client disconnected.');
		endStreaming(socketClient);
	});

	socketClient.on('error', error => {
		logger.error(error);
	});
}

async function startStreaming(socket, request) {
	logger.info(`Starting streaming with keywords "${request}"...`);

	const res = await axios({
		method: 'get',
		url: 'https://api.twitter.com/labs/1/tweets/stream/filter',
		responseType: 'stream',
		headers: {
			Authorization: 'Bearer ' + config.bearerToken,
		},
	});
	console.log(res.headers);
	socket.stream = res.data;

	socket.stream.on('data', chunk => {
		if (socket.disconnected)
			return endStreaming(socket);
		chunk = Buffer.from(chunk).toString();

		if(!chunk.trim())
			return;

		const data = JSON.parse(chunk).data;
		console.log(data);

		// retweets are ignored
		if(data.referenced_tweets)
			return;

		logger.info('Emitting new tweet (' + data.id + ')...');
		socket.emit('tweet', {
			id: data.id,
			content: data.text
		});
	});

	socket.stream.on('error', error => {
		logger.error(error);
		socket.emit('stream_error', error);
	});

	socket.stream.on('end', () => {
		endStreaming(socket);
	});
}

function endStreaming(socketClient) {
	if(!socketClient.stream)
		return;

	socketClient.stream.destroy();
	socketClient.stream = null;
	logger.info('End of stream.');
}

module.exports = {
	onClientConnection
};
