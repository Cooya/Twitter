import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import io from 'socket.io-client';

import StreamingForm from './StreamingForm';
import TweetList from './TweetList';

let socket, index = 0;

const App = () => {
	const [tweets, setTweets] = useState([]);
	const [isStreaming, setStreaming] = useState(false);

	useEffect(() => {
		socket = io('/twitter');

		socket.on('connect', () => {
			toast.success('Connected to the socket server.');

			socket.emit('isStreaming', response => {
				setStreaming(response);
			});
		});

		socket.on('disconnect', () => {
			setStreaming(false);
			toast.success('Disconnected from the socket server.');
		});

		socket.on('stream_error', error => {
			setStreaming(false);
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
		socket.emit('startStreaming', request, response => {
			if (response === 'ok') {
				setStreaming(true);
				toast.success('Streaming started successfully.');
			} else toast.error(response);
		});
	};

	const stopStreaming = () => {
		if (!isStreaming) {
			toast.info('There is no streaming in progress.');
			return;
		}
		setStreaming(false);
		socket.emit('stopStreaming', response => {
			if (response === 'ok') toast.success('Streaming stopped successfully.');
			else toast.error(response);
		});
	};

	const replyToTweet = tweetId => {
		socket.emit('replyToTweet', tweetId, response => {
			if (response === 'ok') {
				toast.success('Reply submitted successfuly.');
				setTweets(tweets => {
					const indexToRemove = tweets.findIndex(tweet => tweet.id === tweetId);
					tweets.splice(indexToRemove, 1);
					return [...tweets];
				});
			} else toast.error(response);
		});
	};

	const deleteTweet = tweetId => {
		socket.emit('deleteTweet', tweetId, response => {
			if (response === 'ok') {
				toast.success('Tweet deleted successfuly.');
				setTweets(tweets => {
					const indexToRemove = tweets.findIndex(tweet => tweet.id === tweetId);
					tweets.splice(indexToRemove, 1);
					return [...tweets];
				});
			} else toast.error(response);
		});
	};

	const getTweets = () => {
		socket.emit('getTweets', {}, response => {
			if(response !== 'ok')
				toast.error(response);
		});
	};

	return (
		<div className="container" style={{ marginBottom: '50px' }}>
			<StreamingForm
				isStreaming={isStreaming}
				startStreaming={startStreaming}
				stopStreaming={stopStreaming}
				getTweets={getTweets}
				clearTweets={() => setTweets([])}
			/>
			<TweetList
				isStreaming={isStreaming}
				tweets={tweets}
				replyToTweet={replyToTweet}
				deleteTweet={deleteTweet}
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