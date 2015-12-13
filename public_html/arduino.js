"use strict";

var os = require('os');
var serverSignature = 'Node.js / Debian ' + os.type() + ' ' + os.release() + ' ' + os.arch() + ' / Raspberry Pi B + Arduino Uno R3';

var postOptions =
{
	host: '192.168.100.63',
	port: '50234',
	path: '/api/temperaturemeasurements',
	method: 'POST',
	headers:
	{
		'Content-Type': 'application/json',
		'Connection': 'close',
		'User-Agent': serverSignature
	}
};

var http = require('http');
function postData(s)
{
	var options = postOptions;
	postOptions.headers['Content-Length'] = s.length;

	var requestPost = http.request(options, function(res)
	{
		res.setEncoding('utf8');
		res.on('data', function (chunk)
		{
			console.log(chunk);
		});
	});

	requestPost.on('error', function(e)
	{
		console.log(e);
	});

	requestPost.write(s);
	requestPost.end();
}

var serialport = require('serialport');
var arduinoSerialPort = '/dev/ttyACM1';
var serialPort = new serialport.SerialPort(arduinoSerialPort,
{
	parser: serialport.parsers.readline('\n')
});

var temperature = NaN;
var humidity = NaN;
var dateLastInfo = new Date(0);

var querystring = require('querystring');
serialPort.on('data', function (data)
{
	try
	{
		var j = JSON.parse(data);
		temperature = j.it;
		humidity = j.ih;
		
		dateLastInfo = new Date().toISOString();
		var dataToPost = {
		    "measurement": {
		        "measurementDateTime": dateLastInfo,
		        "measurementTypeId": 1,
		        "sensorId": 1
		    },
		    "temperature": temperature
		};
		console.log(JSON.stringify(dataToPost));
		postData(JSON.stringify(dataToPost));
	}
	catch (ex)
	{
		console.warn(ex);
	}
});

function sensorResponse()
{
	return {
		'lastTemperature': temperature,
		'html': 
'<html>\n\
<head>\n\
<meta charset="UTF-8" />\n\
<meta http-equiv="refresh" content="300" />\n\
<title>Temperature - Arduino - Raspberry Pi</title>\n\
</head>\n\
<body>\n\
<h1>Temperature at home</h1>\n\
<p>Indoor temperature: ' + temperature + '°C</p>\n\
<p>Indoor humidity: ' + humidity + '%</p>\n\
<p>' + dateLastInfo+ '</p>\n\
</body>\n\
</html>\n\
'
	};
}

module.exports.sensorResponse = sensorResponse;