module.exports = function (app) {

  const express = require('express');
  const router = express.Router();

  /**
   * routes
   */

  const UserController = require('./user/UserController')(app);
  router.use('/users', UserController);

  // const

  /**
   * default error handling
   */
  function errorHandler(err, req, res, next) {
    logger.error(err.stack);
    res.status(err.status || 500).send(err.message);
    next();
  }
  router.use(errorHandler);

  /**
   * default root route for api
   */
  app.use('/api', router);
  app.get('/api', (req, res) => res.status(200).send('Api Works.'));

};