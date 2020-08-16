const logger = require('@coya/logger')();

module.exports = (startStreaming, endStreaming, isStreaming, { onNewTweets, getTweets, replyToTweet, deleteTweet }) => {
	return socketClient => {
		logger.info('Socket client connected.');

		socketClient.on('startStreaming', (query, callback) => {
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

		socketClient.on('isStreaming', callback => {
			callback(isStreaming());
		});

		socketClient.on('getTweets', async (query, callback) => {
			logger.info('Tweets list request received.');
			getTweets(query)
				.then(tweets => {
					callback('ok');
					for(let tweet of tweets) {
						logger.info(`Emitting new tweet ${tweet.id}...`);
						socketClient.emit('tweet', tweet);
					}
				})
				.catch(error => {
					logger.error(error);
					callback(error.message);
				});
			
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
			// endStreaming(socketClient);
		});

		socketClient.on('error', error => {
			logger.error(error);
		});
	};
};
