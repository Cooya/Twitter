const logger = require('@coya/logger')();

module.exports = (startStreaming, endStreaming, { onNewTweets, replyToTweet, deleteTweet }) => {
	return socketClient => {
		logger.info('Twitter socket client connected.');

		socketClient.on('streamingRequest', (query, callback) => {
			logger.info('New streaming request received.');
			startStreaming(socketClient, query, onNewTweets)
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
			replyToTweet(tweetId).then(() => {
				logger.info('Tweet reply submitted successfully.');
				callback('ok');
			}, e => {
				logger.error(e.message);
				callback(e.message);
			});
		});

		socketClient.on('deleteTweet', (tweetId, callback) => {
			logger.info('Tweet deletion request received.');
			deleteTweet(tweetId).then(() => {
				logger.info('Tweet deleted successfully.');
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
	};
};
