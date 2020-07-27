

(async () => {
	const res = await axios({
		method: 'get',
		url: 'https://api.twitter.com/labs/1/tweets/stream/filter',
		responseType: 'stream',
		headers: {
			Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAIs1GQEAAAAAzMTYBOa9cMR07E7TP62TmLxLhqk%3Df3HQ0WGk19PNIIZ6cZ0GkpdxWeD2lprqRQ3QQeFaP1Y1jWKFdS',
		},
	});

	res.data.on('data', chunk => {
		console.log(Buffer.from(chunk).toString());
	});
})();
