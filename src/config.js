var config = {};

config.port = process.env.PORT || 3000;

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
        resetInterval: 3, // Seconds between counter resets
        maxUpdates: 5, // Number of messages allowed within resetInterval seconds
        errorMessage: 'Stop that shit'
    },
    avatar: {
        resetInterval: 5, // Seconds between counter resets 
        maxUpdates: 1, // Number of updates allowed within resetInterval seconds
        errorMessage: 'Who are you, Arturo Brachetti?'
    },
    name: {
        resetInterval: 5,
        maxMessages: 1, 
        maxUpdates: 'Please calm your identity crisis'
    }
};

/**************************
 * General security settings
 **************************/

config.security = {};

// Whether we should compare network traffic to a JSON schema.
config.security.validateMessages = true;


module.exports = config;