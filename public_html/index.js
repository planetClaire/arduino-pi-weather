"use strict";

var path = require('path');
var util = require('util');
var arduino = require('./arduino.js');	//Connection with Arduino
var http = require('http');
var url = require('url');
var os = require('os');
var serverSignature = 'Node.js / Debian ' + os.type() + ' ' + os.release() + ' ' + os.arch() + ' / Raspberry Pi';

function escapeHtml(text)
{
	return text.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function done(request, response)
{
	util.log(request.connection.remoteAddress + '\t' + response.statusCode + '\t"' + request.method + ' ' + request.url + '"\t"' +
		request.headers['user-agent'] + '"\t"' + request.headers['accept-language'] + '"\t"' + request.headers['referer'] + '"');
}

function serve404(request, response, requestUrl)
{
	response.writeHead(404,
	{
		'Content-Type': 'text/html; charset=UTF-8',
		'Date': (new Date()).toUTCString(),
		'Server': serverSignature
	});
	response.end('<!DOCTYPE html>\n\
<html>\n\
<head>\n\
<meta charset="UTF-8" />\n\
<title>404 Not Found</title>\n\
</head>\n\
<body>\n\
<h1>Not Found</h1>\n\
<p>The requested URL' +	escapeHtml(requestUrl.pathname) + ' was not found on this server.</p>\n\
</body>\n\
</html>\n\
');
	done(request, response);
}

function serveHome(request, response, requestUrl)
{
	var now = new Date();
	var sensorResponse = arduino.sensorResponse();
	response.writeHead(200,
	{
		'Content-Type': 'text/html; charset=UTF-8',
		'Date': now.toUTCString(),
		'Server': serverSignature,
		'Last-Modified': sensorResponse.dateLastInfo
	});
	response.end(sensorResponse.html);
	done(request, response);
}

var server = http.createServer(function (request, response)
{
	var requestUrl = url.parse(request.url);
	switch (requestUrl.pathname)
	{
		case '/': serveHome(request, response, requestUrl); break;
		default: serve404(request, response, requestUrl); break;
	}
}).listen(8080);

console.log('Node.js server running at %j', server.address());