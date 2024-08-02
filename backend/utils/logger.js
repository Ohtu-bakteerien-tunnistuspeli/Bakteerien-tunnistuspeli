const winston = require('winston')

const transports = []
transports.push(
  new winston.transports.Console({
    level: 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp('HH.mm.ss'),
      winston.format.printf(
        ({ timestamp, level, message, error, ...rest }) =>
          `${timestamp} ${level}: ${message}${error ? ` ${error?.stack}` : ''}${rest ? ` ${JSON.stringify(rest)}` : ''}`
      )
    ),
  })
)

const logger = winston.createLogger({ transports })

logger.on('error', error => console.error('Logging failed. Reason: ', error)) // eslint-disable-line no-console

module.exports = {
  logger,
}
