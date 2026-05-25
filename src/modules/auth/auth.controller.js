const apiResult = require('../../helpers/api-result.helper');
const authMiddleware = require('./auth.middleware');
const AuthService = require('./auth.service');

const authController = require('express').Router();

authController.post('/signup', async (req, res, next) => {
  try {
    const authService = new AuthService();
    var result = await authService.signup(req.body);
    return res.json(apiResult('Signup successfully', result));
  } catch (error) {
    next(error);
  }
});

authController.post('/signin', async (req, res, next) => {
  try {
    const authService = new AuthService();
    var result = await authService.signin(req.body);
    return res.json(apiResult('Signin successfully', result));
  } catch (error) {
    next(error);
  }
});

authController.post('/signout', authMiddleware, async (req, res, next) => {
  try {
    const authService = new AuthService();
    var result = await authService.signout(req.user.id, req.body);
    return res.json(apiResult('Signout successfully', result));
  } catch (error) {
    next(error);
  }
});

module.exports = authController;
