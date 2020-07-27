import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import io from 'socket.io-client';

import StreamingForm from './StreamingForm';
import TweetList from './TweetList';

let socket, index = 0;

const App = () => {
	const [tweets, setTweets] = useState([]);
	const [streamingInProgress, setStreamingInProgress] = useState(false);

	useEffect(() => {
		socket = io('/twitter');

		socket.on('connect', () => {
			toast.success('Connected to the socket server.');
		});

		socket.on('disconnect', () => {
			setStreamingInProgress(false);
			toast.success('Disconnected from the socket server.');
		});

		socket.on('stream_error', error => {
			setStreamingInProgress(false);
			toast.error(error);
		});

		socket.on('event', toast); // dunno if it happens

		socket.on('tweet', newTweet => {
			setTweets(tweets => {
				if(tweets.find(tweet => tweet.id === newTweet.id))
					return tweets;

				newTweet.index = index++;
				if (tweets.length >= 50)
					tweets.pop();
				tweets.unshift(newTweet);
				return [...tweets];
			});
		});
	}, []);

	const startStreaming = request => {
		if (streamingInProgress) {
			toast.warn('Streaming already in progress.');
			return;
		}

		socket.emit('streamingRequest', request, response => {
			if (response === 'ok') {
				setStreamingInProgress(true);
				toast.success('Streaming started successfully.');
			} else toast.error(response);
		});
	}

	const stopStreaming = () => {
		if (!streamingInProgress) {
			toast.info('There is no streaming in progress.');
			return;
		}
		setStreamingInProgress(false);
		socket.emit('stopStreaming', response => {
			if (response === 'ok') toast.success('Streaming stopped successfully.');
			else toast.error(response);
		});
	};

	const replyToTweet = tweetId => {
		socket.emit('replyToTweet', tweetId, response => {
			if (response === 'ok') toast.success('Reply submitted successfuly.');
			else toast.error(response);
		});
	};

	return (
		<div className="container">
			<StreamingForm
				startStreaming={startStreaming}
				stopStreaming={stopStreaming}
				clearTweets={() => setTweets([])}
			/>
			<TweetList
				streamingInProgress={streamingInProgress}
				tweets={tweets}
				replyToTweet={replyToTweet}
			/>
			<ToastContainer
				hideProgressBar={true}
				autoClose={3000}
				pauseOnFocusLoss={false}
				closeButton={false}
			/>
		</div>
	);
};

export default App;