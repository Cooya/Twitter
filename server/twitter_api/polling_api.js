const logger = require('@coya/logger')();

const twitterApi = require('./standard_api');

async function startStreaming(socket, query, onNewTweets) {
	logger.info(`Starting polling with keywords "${query}"...`);
	query += ' AND -filter:retweets AND -filter:replies';

	const searchTweets = async () => {
		try {
			let tweets = await twitterApi.searchTweets(query, { count: 20 });
			for(let tweet of await onNewTweets(tweets)) {
				logger.info(`Emitting new tweet ${tweet.id}...`);
				socket.emit('tweet', tweet);
			}
			return null;
		} catch(e) {
			logger.error(e);
			const error = e?.errors[0]?.message;
			socket.emit('stream_error', error);
			return error;
		}
	};

	socket.stream = setInterval(searchTweets, 1000 * 60 * 10);
	const error = await searchTweets();
	if(error)
		throw error;
}

function endStreaming(socketClient) {
	if(!socketClient.stream)
		return;
	
	clearInterval(socketClient.stream);
	socketClient.stream = null;
	logger.info('End of polling.');
}

module.exports = {
	startStreaming,
	endStreaming
};
