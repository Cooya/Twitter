const bodyParser = require('body-parser');
const logger = require('@coya/logger')();
const twitterWebhooks = require('twitter-webhooks');

const config = require('./config');

module.exports = async (app, twitter) => {
	app.use(bodyParser.json());

	const userActivityWebhook = twitterWebhooks.userActivity({
		serverUrl: config.serverUrl,
		route: config.webhookRoute,
		consumerKey: config.consumerKey,
		consumerSecret: config.consumerSecret,
		accessToken: config.accessTokenKey,
		accessTokenSecret: config.accessTokenSecret,
		environment: config.devEnv,
		app
	});

	const subscriptionConfig = {
		userId: config.userId,
		accessToken: config.accessTokenKey,
		accessTokenSecret: config.accessTokenSecret
	};

	const webhooks = await userActivityWebhook.getWebhooks();
	if(!webhooks.environments[0].webhooks.length) { // if there is no registered webhook yet
		logger.info('Registering webhook...');
		await userActivityWebhook.register(); // register the webhook url (just needed once per URL)
		logger.info('Webhook registered successfully.');
	}

	try {
		await userActivityWebhook.unsubscribe(subscriptionConfig);
	} catch(e) {}

	// subscribe for a particular user activity
	logger.info('Subscribing to user activity...');
	const userActivity = await userActivityWebhook.subscribe(subscriptionConfig);
	logger.info('Subscribed to user activity successfully.');

	// listen to favorite event
	userActivity.on('favorite', data => {
		logger.info(data);
	});

	// listen to any user activity
	userActivityWebhook.on('event', (event, userId, data) => {
		logger.info(event);
		logger.info(userId);
		logger.info(data);
	});

	// listen to unknown payload (in case of api new features)
	userActivityWebhook.on('unknown-event', rawData => {
		logger.info('unknown-event');
		logger.info(rawData)
	});

	// userActivity
	// 	.on('tweet_create', data => logger.info(data))
	// 	.on('follow', data => logger.info(data))
	// 	.on('mute', data => logger.info(data))
	// 	.on('revoke', data => logger.info(data))
	// 	.on('direct_message', data => logger.info(data))
	// 	.on('direct_message_indicate_typing', data => logger.info(data))
	// 	.on('direct_message_mark_read', data => logger.info(data))
	// 	.on('tweet_delete', data => logger.info(data));
};
