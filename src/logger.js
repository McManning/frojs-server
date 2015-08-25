
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            colorize: true,
            handleExceptions: true,
            timestamp: true
        }),
        new winston.transports.File({
            filename: 'debug.log',
            level: 'debug',
            handleExceptions: true,
            json: true
        })
    ]
});

module.exports = logger;
