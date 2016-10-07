const routes = require('../routes.json');
const express = require('express');
const co = require('co');
const images = require('../controllers/images');
const git = require('../controllers/git');

const controllers = { images, git };
const router = express.Router();

Object.keys(routes).forEach((item) => {
  let [method, path] = item.split(/ +/);
  method = method.toLowerCase();
  router[method](path, co.wrap(function*(req, res, next) {
    const [controller, action] = routes[item].split('.');
    try {
      const result = yield co(controllers[controller][action](req, res, next))
      res.json(result)
    } catch (err) {
      return next(err);
    }
  })
)
});

module.exports = router;
