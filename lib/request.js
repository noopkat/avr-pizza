var https = require('https');
var http = require('http');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');
var zlib = require('zlib');
var boards = require('./boards');

module.exports.requestCompilation = function requestCompilation(package, callback) {
  var host = package.service ? package.service.host : 'avr.pizza';
  var port = package.service ? package.service.port : 443;
  var method = (port === 443) ? https : http;

  var options = {
    hostname: host,
    path: '/compile/v1',
    port: port,
    method : 'POST',
    headers: {
      'User-Agent': 'avrpizza-'+host,
      'Accept': 'application/json',
      'Content-Type': 'application/x-tar',
      'Content-Encoding': 'gzip',
      'X-Version': package.version ||'16800',
      'X-Board': boards[package.board] || package.board,
      'X-Manufacturer': package.manufacturer || 'arduino',
      'X-Arch': package.arch || 'avr'
    }
  };

  var postRequest = method.request(options, function(response) {
  
    var datastring = '';

    response.on('data', function(d) {
        datastring += d;
    });

    response.on('end', function() {
      // done
      var response = JSON.parse(datastring);
      var error = response.error ? new Error(response.error) : null;
      var result = response.data ? response : null;
      return callback(error, result);
    });
  });

  postRequest.on('error', function(e) {
    return callback(new Error('Something went wrong with the API request: '+e));
  }); 

  var gzip = zlib.createGzip();
  package.files.pipe(gzip).pipe(postRequest);
};
