const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
	id: { type: String, required: true, unique: true },
	text: { type: String, required: true },
	tweetDate: { type: Date, required: true },
	replyDate: { type: Date, required: false, default: null },
	isDeleted: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('Tweet', tweetSchema);
