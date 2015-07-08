/** 
 * Dependencies
 */
var debug = require('debug')('frojs:client');
var util = require('util');
//var SchemaValidator = require('jsonschema').Validator;

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
    this.name = '';
    this.avatar = {};
    this.position = [0, 0];
    this.direction = 0;
    this.action = 0;

    debug(util.format(
        '[%s] created for domain [%s]', 
        this.id, this.domain.id
    ));

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

FrojsClient.prototype.onAuthenticate = function(data) {

    // Verify token. Say hi to us dammit!
    if (data.token !== 'hi') {
        this.socket.emit('error', 'Invalid Token');
        return;
    }

    // TODO: Validate their choice of room
    this.room = data.room;

    // TODO: Filter/validate name
    this.name = data.name || this.name;

    // TODO: Validate position
    this.position = data.position || this.position;

    // TODO: Validate blah blah blah
    this.direction = data.direction || this.direction;
    this.action = data.action || this.action;

    // TODO: Validate avatar format
    this.avatar = data.avatar || this.avatar;

    // Join the room for our domain
    debug(util.format(
        '[%s] authenticated for domain [%s:%s]',
        this.id, this.domain.id, this.room
    ));

    // Send some state data to the newly authenticated client
    this.socket.emit('auth', {
        id: this.id,
        room: this.room
    });

    this.socket.join(data.room, this.onSocketJoin);
};

FrojsClient.prototype.onJoin = function(data) {

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
    debug(util.format(
        '[%s] request to join room [%s:%s]',
        this.id, this.domain.id, this.room
    ));

    this.socket.join(this.room, this.onSocketJoin);
};

FrojsClient.prototype.onSocketJoin = function() {

    debug(util.format(
        '[%s] joined room [%s:%s]',
        this.id, this.domain.id, this.room
    ));

    // Emit a join of all clients currently in the  
    // room to the originator.
    for (var id in this.domain.clients) {
        if (id !== this.id && this.domain.clients.hasOwnProperty(id)) {
            var client = this.domain.clients[id];

            this.socket.emit('join', {
                id: client.id,
                name: client.name,
                avatar: client.avatar,
                position: client.position,
                direction: client.direction,
                action: client.action
            });
        }
    }

    // Tell the other clients, and the originator, to create
    // a new actor with the originator's data.
    this.domain.ns.to(this.room).emit('join', {
        id: this.id,
        name: this.name,
        avatar: this.avatar,
        position: this.position,
        direction: this.direction,
        action: this.action
    });
};

FrojsClient.prototype.onName = function(data) {

    // TODO: Validate data fields

    this.name = data.name;

    // Emit back to the room, including originator
    this.domain.ns.to(this.room).emit('name', {
        id: this.id,
        name: this.name
    });
};

FrojsClient.prototype.onTyping = function(data) {

    // Non-essential. Emit back to the room.
    this.socket.broadcast.to(this.room).emit('typing', {
        id: this.id
    });
};

FrojsClient.prototype.onSay = function(message) {

    if (typeof message !== 'string') {
        debug(util.format(
            '[%s] invalid [say] packet to domain [%s:%s]. Expected string.',
            this.id, this.domain.id, this.room
        ));

        this.socket.emit('error', {
            responseTo: 'say',
            message: 'Malformed message',
            developerMessage: util.format(
                'Expected string. Got [%s]', 
                typeof message
            )
        });

        return;
    }

    // TODO: Do manipulation of the message and whatnot

    this.lastMessage = message;

    // Emit back to the room, sans originator
    this.socket.broadcast.to(this.room).emit('say', {
        id: this.id,
        message: message
    });
};

FrojsClient.prototype.onMove = function(data) {

    // TODO: Validate data fields

    this.position = data.position;
    this.direction = data.direction;
    this.action = data.action;

    // TODO: Validate data.buffer and ensure it moves us to 
    // the new position from our previous one 

    // Emit our movement back to the room
    this.socket.broadcast.to(this.room).emit('move', {
        id: this.id,
        buffer: data.buffer,
        position: this.position,
        direction: this.direction,
        action: this.action
    });
};

/**
 * Change of avatar network message. Tracks the new avatar
 * and emits it back to other clients in the room. 
 */
FrojsClient.prototype.onAvatar = function(data) {

    // TODO: Validate data fields

    // Idealy, they would upload the entire metadata package of the avatar
    // and this would forward that whole metadata chunk to all other clients.
    // This way we reduce load on the clients by not forcing them to download
    // both the metadata source and the image source, as well as allowing the 
    // server to track and validate metadata, and apply rules for individual domains
    // (e.g. avatar dimension limits, acceptable source rules, etc)

    this.avatar.url = data.url;
    this.avatar.metadata = data.metadata;

    this.domain.ns.to(this.room).emit('avatar', {
        id: this.id,
        url: this.avatar.url,
        metadata: this.avatar.metadata
    });
};

/** 
 * Called by the domain to perform any cleanup prior to 
 * disconnecting the client. 
 */
FrojsClient.prototype.disconnect = function() {
    debug(util.format(
        '[%s] disconnected from domain [%s:%s]',
        this.id, this.domain.id, this.room
    ));

    // Emit leave to the room, if we're in one
    if (this.room) {
        this.socket.broadcast.to(this.room).emit('leave', {
            id: this.id
        });
    }
};

