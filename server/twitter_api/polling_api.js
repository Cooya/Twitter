const logger = require('@coya/logger')();

const twitterApi = require('./standard_api');

let activeStream = null;

async function startStreaming(socketClient, query, onNewTweets) {
	if(activeStream)
		throw new Error('Streaming already in progress.');

	logger.info(`Starting polling with keywords "${query}"...`);
	query += ' AND -filter:retweets AND -filter:replies';

	const searchTweets = async () => {
		try {
			let tweets = await twitterApi.searchTweets(query, { count: 20 });
			for(let tweet of await onNewTweets(tweets)) {
				logger.info(`Emitting new tweet ${tweet.id}...`);
				socketClient.emit('tweet', tweet);
			}
			return null;
		} catch(e) {
			logger.error(e);
			const error = e?.errors[0]?.message;
			socketClient.emit('stream_error', error);
			return error;
		}
	};

	activeStream = setInterval(searchTweets, 1000 * 60 * 10);
	const error = await searchTweets();
	if(error)
		throw error;
}

function endStreaming() {
	if(!activeStream)
		return;
	
	clearInterval(activeStream);
	activeStream = null;
	logger.info('End of polling.');
}

function isStreaming() {
	return !!activeStream;
}

module.exports = {
	startStreaming,
	endStreaming,
	isStreaming
};
