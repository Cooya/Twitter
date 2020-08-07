const mongoose = require('mongoose');

const config = require('../config');
// const { establishTunnel } = require('./ssh');

const dbConfig = {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	socketTimeoutMS: 1000 * 60 * 60 // one hour
};

module.exports = {
	connect: async ({ remote = false, test = false, poolSize = undefined } = {}) => {
		if(remote) {
			// await establishTunnel(config.tunnelConfig);
			// console.log('SSH tunnel established.');

			// await mongoose.connect(config.tunnelConfig.remoteDbUrl, { ...dbConfig, poolSize });
			// console.log('Remote database connection established.');
		} else {
			const dbUrl = test || process.env.NODE_ENV === 'test' ? config.testDbUrl : config.dbUrl;
			await mongoose.connection.readyState === 0 && mongoose.connect(dbUrl, { ...dbConfig, poolSize });
		}
		return mongoose.connection;
	},
	disconnect: async () => {
		await mongoose.disconnect();
	}
};
