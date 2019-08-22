const { createLogger, format, transports } = require('winston');
const fs = require('fs');
require('winston-daily-rotate-file');

const { isLoggerEnable } = require('./config/config').getProps();

const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

module.exports = createLogger({
  level: 'debug',
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

if (!isLoggerEnable) {
  module.exports = {
    info: message => console.log(message),
    error: message => console.error(message),
  };
}
