var config = {};

config.port = process.env.PORT || 3000;

// TODO: Move around. This isn't enabled unless security is on
// (if we're using JSON-schema) so it makes more sense to go there.
// but at the same time, we may want security off and avatar limits on.
//config.avatars = {};
//config.avatars.maxWidth = 128;
//config.avatars.maxHeight = 128;

// Domains registered to the server.
// TODO: Come up with a better pattern of how domain mapping works.
config.domains = [
    {
        ns: 'sybolt',
        domain: 'sybolt.com'
    },
    {
        ns: 'test',
        domain: 'universe.frojs.com'
    }
];


// Flood protection settings. Adjustable per network message
config.flooding = {
    say: {
        resetInterval: 5000, // ms between counter resets
        maxUpdates: 3, // Number of messages allowed within resetInterval seconds
        errorMessage: 'Message did not send: flood protection'
    },
    avatar: {
        resetInterval: 5000, // ms between counter resets 
        maxUpdates: 1, // Number of updates allowed within resetInterval seconds
        errorMessage: 'Who are you, Arturo Brachetti?'
    },
    name: {
        resetInterval: 5000,
        maxUpdates: 1, 
        errorMessage: 'Please calm your identity crisis'
    }
};

/**************************
 * General security settings
 **************************/

config.security = {};

// Whether we should compare network traffic to a JSON schema.
config.security.validateMessages = true;


module.exports = config;