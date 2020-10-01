const express = require('express');
const request = require('request');
const config = require('./config');

const app = express();

app.use((req, res, next) => {
	let [upstream, host] = config[req.hostname];
	let {url, method, headers} = req;
	headers = Object.assign({}, headers, {host, 'accept-encoding': 'gzip'});
	['connection', 'via', 'x-forwarded-for', 'x-forwarded-proto'].forEach(header => delete headers[header]);

	const r = request({
		url: upstream+url,
		headers,
		method,
		gzip: true,
		strictSSL: false
	});

	r.on('response', msg  res.status(msg.statusCode));
	r.on('data', dat => res.write(dat))
	r.on('end', () => res.end());

	req.on('data', dat => r.write(dat));
	req.on('end', () => r.end());
});

app.listen(config.port, () => {
	console.log(`Listening on 0.0.0.0:${config.port}`);
});
