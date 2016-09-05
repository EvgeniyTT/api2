const express = require('express');
const db = require('../public/javascripts/mongo.js');
require('../public/javascripts/models/image.js');

const router = express.Router();
const Image = db.model('Image');

function checkImageFields(req, res, next) {
  if (req.method in ['POST', 'PUT'] && (req.body.src === '' || req.body.description === '')) {
    const err = new Error('Required fields are not populated');
    err.status = 400;
    return next(err);
  }
  next();
}

router.param('imageId', (req, res, next, imageId) => {
  Image.findOne({ _id: imageId }, (err, image) => {
    if (err) { return next(err);
    } else if (!image) {
      err = new Error('Image was not found');
      err.status = 404;
      return next(err);
    }
    req.image = image;
    next();
  });
});

  // routing
router.get('/', (req, res, next) => {
  Image.find((err, images) => {
    if (err) { return next(err);
    } else if (!images) {
      err = new Error('No images were found');
      err.status = 404;
      return next(err);
    }
    res.json(images);
  });
});

router.get('/:imageId', (req, res) => {
  res.json(req.image);
});

router.post('/', checkImageFields, (req, res, next) => {
  const image = new Image(req.body);
  image.save((err) => {
    if (err) { return next(err); }
    res.json(image);
  });
});

router.put('/:imageId', checkImageFields, (req, res, next) => {
  const image = req.body;
  Image.findOneAndUpdate({ _id: req.params.imageId }, image, (err, image) => {
    if (err) { return next(err); }
    res.json(image);
  });
});

router.delete('/:imageId', (req, res, next) => {
  Image.remove({ _id: req.params.imageId }, (err, image) => {
    if (err) { return next(err); }
    res.json(image);
  });
});

module.exports = router;
