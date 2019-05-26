import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.min.css';

class TwitterBot extends React.Component {
	constructor(props) {
		super(props);
		this.state = { tweets: [], streamingInProgress: false };
		this.maxNumberOfTweets = 50;
		this.index = 0;

		this.startStreaming = this.startStreaming.bind(this);
		this.stopStreaming = this.stopStreaming.bind(this);
		this.clearTweets = this.clearTweets.bind(this);
	}

	componentDidMount() {
		this.socket = io('/twitter');

		this.socket.on('connect', () => {
			toast.success('Connected to the socket server.');
		});

		this.socket.on('disconnect', () => {
			this.setState({streamingInProgress: false});
			toast('Disconnected from the socket server.');
		});

		this.socket.on('stream_error', error => {
			this.setState({streamingInProgress: false});
			toast.error(error);
		});

		this.socket.on('event', toast); // dunno if it happends

		this.socket.on('tweet', tweet => {
			for (var i = 0; i < this.state.tweets.length; ++i) if (this.state.tweets[i].id === tweet.id) return;

			this.setState((prevState, props) => {
				tweet.index = this.index++;
				if (prevState.tweets.length >= 50) prevState.tweets.pop();
				prevState.tweets.unshift(tweet);
				return prevState;
			});
		});
	}

	startStreaming(request) {
		if (this.state.streamingInProgress) {
			toast.warn('Streaming already in progress.');
			return;
		}

		this.socket.emit('streamingRequest', request, response => {
			if (response === 'ok') {
				this.setState({streamingInProgress: true});
				toast.success('Streaming started successfully.');
			} else toast.error(response);
		});
	}

	stopStreaming() {
		if (!this.state.streamingInProgress) {
			toast.info('There is no streaming in progress.');
			return;
		}
		this.setState({streamingInProgress: false});
		this.socket.emit('stopStreaming', response => {
			if (response === 'ok') toast.success('Streaming stopped successfully.');
			else toast.error(response);
		});
	}

	clearTweets() {
		this.setState((prevState, props) => {
			prevState.tweets = [];
			return prevState;
		});
	}

	render() {
		return (
			<div className="container">
				<StreamingForm startStreaming={this.startStreaming} stopStreaming={this.stopStreaming} clearTweets={this.clearTweets} />
				<TweetList streamingInProgress={this.state.streamingInProgress} tweets={this.state.tweets} />
				<ToastContainer />
			</div>
		);
	}
}

class StreamingForm extends React.Component {
	constructor(props) {
		super(props);

		this.handleStreamButton = this.handleStreamButton.bind(this);
		this.handleStopButton = this.handleStopButton.bind(this);
		this.handleClearButton = this.handleClearButton.bind(this);
	}

	handleStreamButton(event) {
		if (this.req.value) this.props.startStreaming(this.req.value);
		else toast.warn('Please type keyword(s) in the input.');
	}

	handleStopButton(event) {
		this.props.stopStreaming();
	}

	handleClearButton(event) {
		this.props.clearTweets();
	}

	render() {
		return (
			<section>
				<div className="inner">
					<div className="row uniform 50%">
						<div className="3u 12u$(xsmall)" />
						<div className="6u 12u$(xsmall)">
							<div className="12u$" style={{ marginBottom: '20px' }}>
								<input name="request" placeholder="Request" type="text" ref={req => (this.req = req)} />
							</div>
							<div className="12u$">
								<ul className="actions">
									<li>
										<button onClick={this.handleStreamButton}>Stream</button>
									</li>
									<li>
										<button onClick={this.handleStopButton}>Stop</button>
									</li>
									<li>
										<button onClick={this.handleClearButton}>Clear</button>
									</li>
								</ul>
							</div>
						</div>
						<div className="3u 12u$(xsmall)" />
					</div>
				</div>
			</section>
		);
	}
}

class TweetList extends React.Component {
	render() {
		const message = this.props.streamingInProgress ? <p>Streaming in progress, waiting for tweets matching your keywords...</p> : null;

		const tweets = this.props.tweets.map((tweet, index) => {
			return <div id={'tweet-' + tweet.index} className="tweet" key={tweet.index} />;
		});

		return <section id="tweets">{message}{tweets}</section>;
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevProps.tweets.length) return;

		const lastTweet = prevProps.tweets[0];
		window.twttr.widgets.createTweet(lastTweet.id, document.querySelector('#tweet-' + lastTweet.index));
	}
}

ReactDOM.render(<TwitterBot />, document.getElementById('app'));
