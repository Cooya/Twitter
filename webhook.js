
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

	const webhooks = await userActivityWebhook.getWebhooks();
	if(!webhooks.environments[0].webhooks.length) { // if there is no registered webhook yet
		logger.info('Registering webhook...');
		await userActivityWebhook.register(); // register the webhook url (just needed once per URL)
		logger.info('Webhook registered successfully.');
	}

	const subscriptionConfig = {
		userId: config.userId,
		accessToken: config.accessTokenKey,
		accessTokenSecret: config.accessTokenSecret
	};

	let userActivity;
	const subscriptions = await userActivityWebhook.getSubscriptions();
	if(!subscriptions.length) {
		logger.info('Subscribing to user activity...');
		userActivity = await userActivityWebhook.subscribe(subscriptionConfig);
		logger.info('Subscribed to user activity successfully.');
	} else userActivity = userActivityWebhook.getUserActivity({userId: subscriptions[0].userId});

	logger.info('Webhook ready to receive events.');

	// this seems to be not working
	userActivity
		.on('favorite', data => logger.info(data))
		.on('tweet_create', data => logger.info(data))
		.on('follow', data => logger.info(data))
		.on('mute', data => logger.info(data))
		.on('revoke', data => logger.info(data))
		.on('direct_message', data => logger.info(data))
		.on('direct_message_indicate_typing', data => logger.info(data))
		.on('direct_message_mark_read', data => logger.info(data))
		.on('tweet_delete', data => logger.info(data));

	// listen to any user activity
	userActivityWebhook.on('event', async (event, userId, data) => {
		if(event == 'tweet_create') {
			logger.info(`The bot has been mentioned by "${data.user.screen_name}".`);

			if(data.user.screen_name != config.personalTwitterAccount)
				return;

			// retweet the post
			try {
				logger.info('Retweeting the post...');
				await twitter.post('statuses/retweet/' + data.in_reply_to_status_id_str, {});
				logger.info('Anwsering to the comment...');
				await twitter.post('statuses/update', {status: '@' + data.user.screen_name + ' Retweeted !', in_reply_to_status_id: data.in_reply_to_user_id});
				logger.info('Done.');
			} catch(e) {
				logger.error(e);
			}
		} else logger.info(event, userId, data);
	});

	// listen to unknown payload (in case of api new features)
	userActivityWebhook.on('unknown-event', rawData => {
		logger.info('unknown-event');
		logger.info(rawData)
	});
};
