const axios = require('axios');
const logger = require('@coya/logger')();

const config = require('../../config');

async function startStreaming(socket, query, onNewTweets) {
	logger.info(`Starting streaming with keywords "${query}"...`);

	const res = await axios({
		method: 'get',
		url: 'https://api.twitter.com/labs/1/tweets/stream/filter',
		responseType: 'stream',
		headers: {
			Authorization: 'Bearer ' + config.bearerToken,
		},
	});
	socket.stream = res.data;

	socket.stream.on('data', chunk => {
		if (socket.disconnected)
			return endStreaming(socket);
		chunk = Buffer.from(chunk).toString();

		if(!chunk.trim())
			return;

		const data = JSON.parse(chunk).data;

		// retweets are ignored
		if(!data || data.referenced_tweets)
			return;

		onNewTweets([data]).then(tweets => {
			for(let tweet of tweets) {
				logger.info(`Emitting new tweet ${tweet.id}...`);
				socket.emit('tweet', tweet);
			}
		}, error => {
			logger.error(error);
			socket.emit('stream_error', error.message);
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
	startStreaming,
	endStreaming
};
