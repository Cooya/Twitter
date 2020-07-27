const Twitter = require('twitter-lite');

const config = require('./config');

const client = new Twitter({
	consumer_key: config.consumerKey,
	consumer_secret: config.consumerSecret,
	access_token_key: config.accessTokenKey,
	access_token_secret: config.accessTokenSecret,
	bearer_token: config.bearer_token,
});

// (async() => {
// 	const tweets = await client.get('statuses/home_timeline');
// 	console.log(`Rate: ${tweets._headers.get('x-rate-limit-remaining')} / ${tweets._headers.get('x-rate-limit-limit')}`);
// 	const delta = (tweets._headers.get('x-rate-limit-reset') * 1000) - Date.now()
// 	console.log(`Reset: ${Math.ceil(delta / 1000 / 60)} minutes`);

// 	const statuses = await client.get('application/rate_limit_status');
// 	console.log(statuses.resources.labs);
// })();

async function replyToTweet(tweetId, status) {
	await client.post('statuses/update', {
		status,
		in_reply_to_status_id: tweetId,
		auto_populate_reply_metadata: true,
	});
}

module.exports = {
	replyToTweet,
};
