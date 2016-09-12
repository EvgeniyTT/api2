require('../src/models/image.js');
const newError = require('../lib/errorFactory');
const routes = require('../routes.js');
const express = require('express');
const co = require('co');
const images = require('../controllers/images');
const git = require('../controllers/git');

const controllers = { images, git };
const router = express.Router();

Object.keys(routes).forEach((item) => {
  let [httpMethod, path] = item.split(/ +/);
  httpMethod = httpMethod.toLowerCase();
  router[httpMethod](path, co.wrap(function*(req, res, next) {
    const [controller, fn] = routes[item].split('.');
    try {
      const result = yield co(controllers[controller][fn](req))
      res.json(result)
    } catch (err) {
      return next(err);
    }
  })
)
});

module.exports = router;
