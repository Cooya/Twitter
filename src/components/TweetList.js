import React, { useEffect } from 'react';

const TweetList = ({ isStreaming, tweets, replyToTweet, deleteTweet }) => {
	useEffect(() => {
		if(!tweets.length)
			return;

		const tweetContainer = document.querySelector('#tweet-' + tweets[0].id);
		if(!tweetContainer || !tweetContainer.hasChildNodes())
			window.twttr.widgets.createTweet(tweets[0].id, document.querySelector('#tweet-' + tweets[0].id));
	}, [tweets]);

	return <section id="tweets">
		{isStreaming ? <p>Streaming in progress, waiting for tweets matching your keywords...</p> : null}
		{tweets.map(tweet =>
			<div key={tweet.id}>
				<div id={'tweet-' + tweet.id} className="tweet" />
				<button onClick={() => replyToTweet(tweet.id)} style={{ marginRight: '10px' }}>Reply</button>
				<button onClick={() => deleteTweet(tweet.id)} style={{ marginLeft: '10px' }}>Delete</button>
			</div>
		)}
	</section>;
};

export default TweetList;
