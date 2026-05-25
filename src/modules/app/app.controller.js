const apiResult = require('../../helpers/api-result.helper');

const appController = require('express').Router();

appController.get('/health', (req, res) => {
  res.json(apiResult('App is healthy'));
});

module.exports = appController;
