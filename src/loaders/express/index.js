const express = require('express');
const cors = require('cors');

const { MESSAGES } = require('../../commons/constants');
const apiResult = require('../../helpers/api-result.helper');
const logger = require('../winston');

const app = express();

// Setup middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Setup routes
const mainApi = express.Router();
mainApi.use('/app', require('../../modules/app/app.controller'));
mainApi.use('/auth', require('../../modules/auth/auth.controller'));
mainApi.use('/users', require('../../modules/users/user.controller'));
mainApi.use('/devices', require('../../modules/devices/device.controller'));
mainApi.use(
  '/user-notifications',
  require('../../modules/user-notifications/user-notification.controller'),
);

app.use('/api', mainApi);

// Error handler
app.use((err, req, res, next) => {
  logger.error(err);

  if (err.message === MESSAGES.BAD_REQUEST) {
    return res.status(400).json(apiResult(err.message));
  } else if (err.message === MESSAGES.UNAUTHORIZED) {
    return res.status(401).json(apiResult(err.message));
  } else if (err.message === MESSAGES.NOT_FOUND) {
    return res.status(404).json(apiResult(err.message));
  }

  res.status(500).json(apiResult(err.message || MESSAGES.INTERNAL_SERVER_ERROR));

  return next();
});

module.exports = app;

// chuc nang la khoi tao express server, va dang ky cac route cho api, cung nhu xu ly loi khi co loi xay ra trong qua trinh xu ly request, va tra ve response cho client theo dinh dang da thiet lap trong apiResult helper, de dong bo hoa cac response tra ve cho client, giup cho viec xu ly response o client de don gian hon, va cung giup cho viec giai thich loi khi co loi xay ra trong qua trinh xu ly request, de client co the hieu duoc loi xay ra la gi va co the xu ly loi do mot cach thich hop hon.
