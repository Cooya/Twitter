const config = require('../config');

const Tweet = require('./models/Tweet');

module.exports = {
	onNewTweets: async tweets => {
		console.log(`${tweets.length} tweets received.`);
		
		const tweetsToReturn = [];
		await Promise.all(tweets.map(async tweet => {
			const dbTweet = await Tweet.findOne({ id: tweet.id_str });
			if(!dbTweet) {
				tweetsToReturn.push(await Tweet.create({
					id: tweet.id_str,
					text: tweet.text,
					tweetDate: tweet.created_at
				}));
			}
			else if(!dbTweet.replyDate && !dbTweet.isDeleted)
				tweetsToReturn.push(dbTweet);
		}));

		return tweetsToReturn.sort((a, b) => a.tweetDate - b.tweetDate);
	},

	getTweets: async () => {
		return await Tweet.find({ replyDate: null, isDeleted: false }).sort({ tweetDate: -1 }).limit(20);
	},

	replyToTweet: async tweetId => {
		const { replyToTweet: reply } = require('./twitter_api/standard_api');
		await reply(tweetId, config.replyMessage);
		await Tweet.updateOne({ id: tweetId }, { replyDate: new Date() });
	},

	deleteTweet: async tweetId => {
		await Tweet.updateOne({ id: tweetId }, { isDeleted: true });
	}
};
