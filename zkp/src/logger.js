import { createLogger, format, transports } from 'winston';
import { inspect } from 'util';
import config from 'config';

function formatWithInspect(val) {
  return `${val instanceof Object ? '\n' : ''} ${inspect(val, { depth: null, colors: true })}`;
}

const consoleLogger = {
  info: message => console.log(message),
  error: message => console.error(message),
};

let winstonLogger;

if (config.get('isLoggerEnable')) {
  winstonLogger = createLogger({
    level: 'debug',
    format: format.combine(
      format.colorize(),
      format.printf(info => {
        const splatArgs = info[Symbol.for('splat')] || [];
        const rest = splatArgs.map(data => formatWithInspect(data)).join();
        return `${info.level}: ${info.message} ${rest}`;
      }),
    ),
    transports: [new transports.Console()],
  });
}

const logger = winstonLogger || consoleLogger;

export default logger;
