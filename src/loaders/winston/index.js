const winston = require('winston');

const config = require('../../commons/configs');
const { AppRunMode } = require('../../commons/constants');

const vietnameseTimeZone = () => {
  return new Date().toLocaleString('vn-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};

const transports = [];
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(winston.format.cli(), winston.format.splat()),
  }),
);
if (config.APP_RUN_MODE === AppRunMode.PROD) {
  transports.push(
    new winston.transports.File({
      level: 'info',
      filename: 'logs/app.log',
    }),
    new winston.transports.File({
      level: 'error',
      filename: 'logs/error.log',
    }),
  );
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: vietnameseTimeZone,
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports,
});

module.exports = logger;


// chuc nang la khoi tao winston logger, va cau hinh cac transport de ghi log vao console va file, cung nhu dinh dang cua log, de giup cho viec ghi log duoc dong bo hoa va de doc hon, va cung giup cho viec phan tich log khi co loi xay ra trong qua trinh xu ly request, de client co the hieu duoc loi xay ra la gi va co the xu ly loi do mot cach thich hop hon.