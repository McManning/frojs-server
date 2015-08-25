/** 
 * Dependencies
 */
var util = require('util');
var logger = require('./logger');
var config = require('./config');
var validate = require('jsonschema').validate;
// TODO: Verify that validate() is more optimal than calling new Validator() once

/** 
 * Module exports
 */
module.exports = FrojsClient;

/*
    From the scope of this class:

    To send to room EXCLUDING self:
        this.socket.broadcast.to(this.room).emit(...)
    
    To send to room INCLUDING self:
        this.domain.ns.to(this.room).emit(...)

    To send to self:
        this.socket.emit(...)
*/

/**
 * Interface to a frojs client. This handles all message processing
 * and routing for an individual client connected to a frojs domain.
 *
 * @param {FrojsDomain} domain instance 
 * @param {Socket} socket connection
 */
function FrojsClient(domain, socket) {
    this.socket = socket;
    this.domain = domain;
    this.room = null;
    this.id = socket.id;
    this.lastMessage = '';
    this.name = 'Guest';
    this.avatar = {};
    this.state = [0, 0, 0, 0, 0]; // (x, y, z, direction, action)

    logger.info(
        '[%s] created for domain [%s]', 
        this.id, this.domain.id
    );

    //this.disconnect = this.disconnect.bind(this);
    this.onAuthenticate = this.onAuthenticate.bind(this);
    this.onJoin = this.onJoin.bind(this);
    this.onSocketJoin = this.onSocketJoin.bind(this);
    this.onName = this.onName.bind(this);
    this.onTyping = this.onTyping.bind(this);
    this.onSay = this.onSay.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onAvatar = this.onAvatar.bind(this);

    socket.on('auth', this.onAuthenticate);
    socket.on('join', this.onJoin);
    socket.on('name', this.onName);
    socket.on('typing', this.onTyping);
    socket.on('say', this.onSay);
    socket.on('move', this.onMove);
    socket.on('avatar', this.onAvatar);
}

/**
 * Override to print a minimal summary of this client instance.
 */
FrojsClient.prototype.toString = function() {
    return util.format(
        '<id=%s, ip=%s, domain=%s, room=%s>', 
        this.id, 
        this.socket.conn.remoteAddress,
        this.domain.id,
        this.room
    );
}

FrojsClient.prototype.onAuthenticate = function(data) {
    logger.debug('`auth` message from %s', this, {payload: data});

    if (config.security.validateMessages === true) {
        /*if (!validate(data, schema.network.auth)) {
            this.socket.emit('error', 'Invalid `auth` message');
            logger.error('Malformed `auth` from %j: %j', this, {payload: data});
        }*/
    }

    // Verify token. Say hi to us dammit!
    if (data.token !== 'hi') {
        this.socket.emit('error', 'Invalid Token');
        logger.error('Invalid `auth` token from %s', this);
        return;
    }

    // TODO: Validate their choice of room
    this.room = data.room;

    // TODO: Filter/validate name
    this.name = data.name || this.name;

    // TODO: Validate state
    this.state = data.state || this.state;

    // TODO: Validate avatar format
    this.avatar = data.avatar || this.avatar;

    // Join the room for our domain
    logger.info(
        '[%s] authenticated for domain [%s:%s]',
        this.id, this.domain.id, this.room
    );

    // Send some state data to the newly authenticated client
    this.socket.emit('auth', {
        id: this.id,
        room: this.room
    });

    this.socket.join(data.room, this.onSocketJoin);
};

FrojsClient.prototype.onJoin = function(data) {
    logger.debug('`join` message from %s', this, {payload: data});

    // TODO: Validate their choice of room
    // TODO: Maybe not assign room until join is successful.

    // Emit leave to the old room, if we're in one
    if (this.room) {
        this.socket.broadcast.to(this.room).emit('leave', {
            id: this.id
        });
    }

    this.room = data.room;

    // Join the room for our domain
    logger.info(
        '[%s] request to join room [%s:%s]',
        this.id, this.domain.id, this.room
    );

    this.socket.join(this.room, this.onSocketJoin);
};

FrojsClient.prototype.onSocketJoin = function() {
    logger.info(
        '[%s] joined room [%s:%s]',
        this.id, this.domain.id, this.room
    );

    // Emit a join of all clients currently in the  
    // room to the originator.
    for (var id in this.domain.clients) {
        if (id !== this.id && this.domain.clients.hasOwnProperty(id)) {
            var client = this.domain.clients[id];

            if (client.room == this.room) {
                logger.debug(
                    '[%s] receiving `join` for existing client [%s]',
                    this.id, client.id
                );
                
                this.socket.emit('join', {
                    id: client.id,
                    name: client.name,
                    avatar: client.avatar,
                    state: client.state
                });
            } else {
                logger.debug(
                    '[%s] ignoring client not in room [%s]',
                    this.id, client.id
                );
            }
        }
    }

    logger.debug(
        '[%s] sending `join` to room and self',
        this.id
    );
    // Tell the other clients, and the originator, to create
    // a new actor with the originator's data.
    this.domain.ns.to(this.room).emit('join', {
        id: this.id,
        name: this.name,
        avatar: this.avatar,
        state: this.state
    });
};

FrojsClient.prototype.onName = function(data) {
    logger.debug('`name` message from %s', this, {payload: data});

    // TODO: Validate data fields

    this.name = data.name;

    // Emit back to the room, including originator
    this.domain.ns.to(this.room).emit('name', {
        id: this.id,
        name: this.name
    });
};

FrojsClient.prototype.onTyping = function(data) {
    logger.debug('`typing` message from %s', this, {payload: data});

    // Non-essential. Emit back to the room.
    this.socket.broadcast.to(this.room).emit('typing', {
        id: this.id
    });
};

FrojsClient.prototype.onSay = function(data) {
    logger.debug('`say` message from %s', this, {payload: data});

    if (typeof data.message !== 'string') {
        logger.error(
            '[%s] invalid [say] packet to domain [%s:%s]. Expected string.',
            this.id, this.domain.id, this.room
        );

        this.socket.emit('err', {
            responseTo: 'say',
            message: 'Malformed message',
            developerMessage: 'Expected string for `message`'
        });

        return;
    }

    // TODO: Do manipulation of the message and whatnot

    this.lastMessage = data.message;

    // Emit back to the room, sans originator
    this.socket.broadcast.to(this.room).emit('say', {
        id: this.id,
        message: data.message
    });
};

FrojsClient.prototype.onMove = function(data) {
    logger.debug('`move` message from %s', this, {payload: data});

    // TODO: Validate data fields
    this.state = data.state;

    // TODO: Validate data.buffer and ensure it moves us to 
    // the new position from our previous one 

    // Emit our movement back to the room
    this.socket.broadcast.to(this.room).emit('move', {
        id: this.id,
        buffer: data.buffer,
        state: this.state
    });
};

/**
 * Change of avatar network message. Tracks the new avatar
 * and emits it back to other clients in the room. 
 */
FrojsClient.prototype.onAvatar = function(data) {
    logger.debug('`avatar` message from %s', this, {payload: data});

    // TODO: Validate data fields

    // Idealy, they would upload the entire metadata package of the avatar
    // and this would forward that whole metadata chunk to all other clients.
    // This way we reduce load on the clients by not forcing them to download
    // both the metadata source and the image source, as well as allowing the 
    // server to track and validate metadata, and apply rules for individual domains
    // (e.g. avatar dimension limits, acceptable source rules, etc)

    this.avatar = data.metadata;

    this.domain.ns.to(this.room).emit('avatar', {
        id: this.id,
        metadata: this.avatar
    });
};

/** 
 * Called by the domain to perform any cleanup prior to 
 * disconnecting the client. 
 */
FrojsClient.prototype.disconnect = function() {
    logger.info('%s disconnected', this);

    // Emit leave to the room, if we're in one
    if (this.room) {
        this.socket.broadcast.to(this.room).emit('leave', {
            id: this.id
        });
    }
};

