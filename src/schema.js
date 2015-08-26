/*
    JSON-schema for transport messages. Used for validation purposes
*/
var Validator = require('jsonschema').Validator;

var schema = {};
schema.validator = new Validator();
schema.entity = {};
schema.network = {};

schema.entity.avatar = {
    "id": "/Entity/Avatar",
    "type": "object",
    "required": [
        "type",
        "url",
        "width",
        "height",
        "keyframes"
    ],
    "properties": {
        "type": {
            "type": "string",
            "pattern": "^Animation$"
        },
        "autoplay": {
            "type": "boolean"
        },
        "url": {
            "type": "string",
        },
        "width": {
            "type": "integer",
            "minimum": 1,
            "maximum": 128
        },    
        "height": {
            "type": "integer",
            "minimum": 1,
            "maximum": 128
        },
        "keyframes": {
            "type": "object",
            "properties": {
                "move_2": {
                    "$ref": "#/definitions/frameset"
                },
                "move_8": {
                    "$ref": "#/definitions/frameset"
                },
                "move_4": {
                    "$ref": "#/definitions/frameset"
                },
                "move_6": {
                    "$ref": "#/definitions/frameset"
                },
                "stop_2": {
                    "$ref": "#/definitions/frameset"
                },
                "stop_8": {
                    "$ref": "#/definitions/frameset"
                },
                "stop_4": {
                    "$ref": "#/definitions/frameset"
                },
                "stop_6": {
                    "$ref": "#/definitions/frameset"
                },
                "act_2": {
                    "$ref": "#/definitions/frameset"
                },
                "act_8": {
                    "$ref": "#/definitions/frameset"
                },
                "act_4": {
                    "$ref": "#/definitions/frameset"
                },
                "act_6": {
                    "$ref": "#/definitions/frameset"
                }
            }
        }
    },
    "definitions": {
        "frameset": {
            "type": "object",
            "required": [
                "loop",
                "frames"
            ],
            "properties": {
                "loop": {
                    "type": "boolean"
                },
                "frames": {
                    "type": "array",
                    "items": {
                        "type": "number"
                    },
                    "minItems": 2
                }
            }
        }
    }
};

schema.entity.state = {
    "id": "/Entity/State",
    "type": "array",
    "items": {
        "type": "number"
    },
    "minItems": 5,
    "maxItems": 5
    // TODO: We can't really JSON-schema validate specific entries
    // of the state. (That is, ensuring Action falls within the enum)
};

schema.network.auth = {
    "id": "/Network/Auth",
    "type": "object",
    "required": [
        "token",
        "room",
        "name",
        "avatar",
        "state"
    ],
    "properties": {
        "token": {
            "type": "string"
        },
        "room": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "avatar": {
            "$ref": "/Entity/Avatar"
        },
        "state": {
            "$ref": "/Entity/State"
        }
    }
};

schema.network.join = {
    "id": "/Network/Join",
    "type": "object",
    "required": [
        "room"
    ],
    "properties": {
        "room": {
            "type": "string",
            "minLength": 1,
            "maxLength": 50
            // TODO: Don't hardcode this. Should be a config var.
        }
    }
};

schema.network.name = {
    "id": "/Network/Name",
    "type": "object",
    "required": [
        "name"
    ],
    "properties": {
        "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 50
            // TODO: Don't hardcode this. Should be a config var.
        }
    }
};

schema.network.say = {
    "id": "/Network/Say",
    "type": "object",
    "required": [
        "message"
    ],
    "properties": {
        "message": {
            "type": "string",
            "minLength": 1,
            "maxLength": 500 
            // TODO: Don't hardcode this. Should be a config var.
        }
    }
};

schema.network.move = {
    "id": "/Network/Move",
    "type": "object",
    "required": [
        "buffer",
        "state"
    ],
    "properties": {
        "buffer": {
            "type": "string"
        },
        "state": {
            "$ref": "/Entity/State"
        }
    }
};

schema.network.avatar = {
    "id": "/Network/Avatar",
    "$ref": "/Entity/Avatar"
};

var s;

for (s in schema.entity) {
    if (schema.entity.hasOwnProperty(s)) {
        schema.validator.addSchema(
            schema.entity[s], 
            schema.entity[s].id
        );
    }
}

for (s in schema.network) {
    if (schema.network.hasOwnProperty(s)) {
        schema.validator.addSchema(
            schema.entity[s], 
            schema.network[s].id
        );
    }
}

module.exports = schema;