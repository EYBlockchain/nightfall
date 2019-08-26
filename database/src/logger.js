import { createLogger, format, transports } from 'winston';
import mongoose from 'mongoose';
import { getProps } from './config';

const { isLoggerEnable } = getProps();

const consoleLogger = {
  info: message => console.log(message),
  error: message => console.error(message),
};

let winstonLogger;

if (isLoggerEnable) {
  winstonLogger = createLogger({
    level: 'debug',
    format: format.combine(format.colorize(), format.simple()),
    transports: [new transports.Console()],
  });

  mongoose.set('debug', true);
}

const logger = winstonLogger || consoleLogger;

export default logger;
