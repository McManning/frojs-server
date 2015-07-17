/*
    Various notes:

    To debug, execute on the command line as:
        DEBUG=* node app

    or, on windows, two liner:
    set DEBUG=*
    node app

    We can scope debug to whatever, so DEBUG=frojs*,socket.io* node app
        catches frojs, frojs:client, socket.io:socket, socket.io:io-parser, etc...
*/
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var util = require('util');
var debug = require('debug')('frojs:app');
//var FrojsClient = require('./FrojsClient');
var FrojsDomain = require('./FrojsDomain');

var clients = {};

// Eventually this will come from a config file. 
var config = {

    // Domains registered to the server
    domains: [
        {
            ns: 'sybolt',
            domain: 'sybolt.com'
        },
        {
            ns: 'universe',
            domain: 'frojs.com'
        }
    ]
};

var domains = {};

// Load all domains as available namespaces, and connect events to global io
for (var i = 0; i < config.domains.length; i++) {
    domains[config.domains[i].ns] = new FrojsDomain(io, config.domains[i]);
}

// Some basic HTTP routes
app.get('/', function(request, response) {
    response.send('Hello!');
});

http.listen(3000, function() {
    debug('Listening on *:3000');
});

