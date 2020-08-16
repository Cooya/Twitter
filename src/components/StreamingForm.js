import React, { useState } from 'react';
import { toast } from 'react-toastify';

const StreamingForm = ({ isStreaming, startStreaming, stopStreaming, getTweets, clearTweets }) => {
	const [request, setRequest] = useState('recherche OR cherche AND maison OR appartement OR appart OR logement OR loyer');

	const startStreamingWrap = () => {
		if(!request) toast.warn('Please type keyword(s) in the input.');
		else startStreaming(request);
	};

	return (
		<section>
			<div className="inner">
				<div className="row uniform 50%">
					<div className="3u 12u$(xsmall)" />
					<div className="6u 12u$(xsmall)">
						<div className="12u$" style={{ marginBottom: '20px' }}>
							<input name="request" placeholder="Request" type="text" value={request} onChange={e => setRequest(e.target.value)} />
						</div>
						<div className="12u$">
							<ul className="actions">
								<li>
									<button onClick={startStreamingWrap} disabled={isStreaming}>Start</button>
								</li>
								<li>
									<button onClick={stopStreaming} disabled={!isStreaming}>Stop</button>
								</li>
								<li>
									<button onClick={getTweets}>Get</button>
								</li>
								<li>
									<button onClick={clearTweets}>Clear</button>
								</li>
							</ul>
						</div>
					</div>
					<div className="3u 12u$(xsmall)" />
				</div>
			</div>
		</section>
	);
};

export default StreamingForm;
