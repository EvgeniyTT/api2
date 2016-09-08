require('../public/javascripts/models/image.js');
const express = require('express');
const db = require('../public/javascripts/mongo.js');
const async = require('asyncawait/async');
const wait = require('asyncawait/await');
const newError = require('./errorFactory');
const co = require('co');

const router = express.Router();
const Image = db.model('Image');

function checkImageFields(req, res, next) {
  if (req.body.src === '' || req.body.description === '') {
    return next(newError(400, 'Required fields are not populated'));
  }
  next();
}

router.param('imageId', co.wrap(function*(req, res, next, imageId) {
  const result = yield Image.findOne({ _id: imageId });
  if (!result) {
    return next(newError(404, 'Image was not found'));
  }
  req.image = result;
  next();
}));

// routing
router.get('/', co.wrap(function*(req, res, next) {
  const images = yield Image.find();
  if (images.length === 0) {
    return next(newError(404, 'No images were found'));
  }
  res.json(images);
}));

router.get('/:imageId', (req, res) => {
  res.json(req.image);
});

router.post('/', checkImageFields, co.wrap(function*(req, res, next) {
  const image = new Image(req.body);
  const result = yield image.save();
  res.json(result);
}));

router.put('/:imageId', checkImageFields, co.wrap(function*(req, res, next) {
  const image = req.body;
  const result = yield Image.findOneAndUpdate({ _id: req.params.imageId }, image);
  res.json(result);
}));

router.delete('/:imageId', co.wrap(function*(req, res) {
  const result = yield Image.remove({ _id: req.params.imageId });
  res.json(result);
}));

module.exports = router;
