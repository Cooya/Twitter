import React, { useEffect } from 'react';

const TweetList = ({ streamingInProgress, tweets, replyToTweet }) => {
	useEffect(() => {
		if(!tweets.length)
			return;

		window.twttr.widgets.createTweet(tweets[0].id, document.querySelector('#tweet-' + tweets[0].index));
	}, [tweets]);

	return <section id="tweets">
		{streamingInProgress ? <p>Streaming in progress, waiting for tweets matching your keywords...</p> : null}
		{tweets.map(tweet => 
			<div key={tweet.index}>
				<div id={'tweet-' + tweet.index} className="tweet" />
				<button onClick={() => replyToTweet(tweet.id)}>Reply</button>
			</div>
		)}
	</section>;
}

export default TweetList;
