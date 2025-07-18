import winston from "winston";

const level = process.env.NODE_ENV === "development" ? "debug" : "info";

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf((info) => `${info.level}: ${info.message}`)
);

const logger = winston.createLogger({
  level: level,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

export default logger;
