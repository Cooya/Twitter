const bodyParser = require('body-parser');
const twitterWebhooks = require('twitter-webhooks');

const config = require('./config');

module.exports = async app => {
	app.use(bodyParser.json());

	const userActivityWebhook = twitterWebhooks.userActivity({
		serverUrl: config.serverUrl,
		route: config.webhookRoute,
		consumerKey: config.twitterConsumerKey,
		consumerSecret: config.twitterConsumerSecret,
		accessToken: config.twitterAccessTokenKey,
		accessTokenSecret: config.twitterAccessTokenSecret,
		environment: config.devEnv,
		app
	});

	// register the webhook url (just needed once per URL)
	await userActivityWebhook.register();

	// subscribe for a particular user activity
	const userActivity = await userActivityWebhook.subscribe({
		userId: '14911318',
		accessToken: config.twitterAccessTokenKey,
		accessTokenSecret: config.twitterAccessTokenSecret
	});

	userActivity
		.on('favorite', data => console.log(userActivity.id + ' - favorite'))
		.on('tweet_create', data => console.log(userActivity.id + ' - tweet_create'))
		.on('follow', data => console.log(userActivity.id + ' - follow'))
		.on('mute', data => console.log(userActivity.id + ' - mute'))
		.on('revoke', data => console.log(userActivity.id + ' - revoke'))
		.on('direct_message', data => console.log(userActivity.id + ' - direct_message'))
		.on('direct_message_indicate_typing', data => console.log(userActivity.id + ' - direct_message_indicate_typing'))
		.on('direct_message_mark_read', data => console.log(userActivity.id + ' - direct_message_mark_read'))
		.on('tweet_delete', data => console.log(userActivity.id + ' - tweet_delete'));

	// listen to any user activity
	userActivityWebhook.on('event', (event, userId, data) => console.log(userId + ' - favorite'));

	// listen to unknown payload (in case of api new features)
	userActivityWebhook.on('unknown-event', rawData => console.log(rawData));
};
