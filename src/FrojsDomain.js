/** 
 * Dependencies
 */
var util = require('util');
var logger = require('./logger');
var FrojsClient = require('./FrojsClient');

/** 
 * Module exports
 */
module.exports = FrojsDomain;

/**
 * Interface to a frojs domain.
 *
 * @param {String} id
 */
function FrojsDomain(io, properties) {
    this.io = io;
    this.domain = properties.domain;
    this.id = properties.ns; // Match our id to our namespace
    this.clients = {};

    logger.info(
        'New frojs domain [%s] with namespace [%s]', 
        this.domain, properties.ns
    );

    // Setup listeners
    var ns = io.of(properties.ns);
    ns.on('connection', this.onConnection.bind(this));

    this.ns = ns;
}

/** 
 * Process connection to a specific domain namespace
 *
 * @param {Socket} socket 
 */
FrojsDomain.prototype.onConnection = function(socket) {
    
    logger.info(
        '[%s] connection from [%s]',
        this.id,
        socket.client.conn.remoteAddress
    );

    // Dump rooms as a test
    logger.debug(
        this.ns.adapter.rooms
    );

    //console.log(socket);

    // Create a new client data instance
    this.clients[socket.id] = new FrojsClient(this, socket);

    var self = this;
    socket.on('disconnect', function() {
        logger.info(
            '[%s] disconnect from [%s]',
            self.id,
            socket.client.conn.remoteAddress
        );

        // TODO: Notify client it's about to be deleted
        if (self.clients[socket.id]) {
            self.clients[socket.id].disconnect();
            delete self.clients[socket.id];
        }
    });
};

