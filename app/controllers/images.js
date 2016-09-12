const newError = require('../lib/errorFactory');
const db = require('../lib/mongo.js');

const Image = db.model('Image');

module.exports = {
  * getOne(req) {
    const result = yield Image.findOne({ _id: req.params.imageId });
    if (!result) {
      throw newError(404, 'Image was not found');
    }
    return result;
  },
  * list(req) {
    const images = yield Image.find();
    if (images.length === 0) {
      throw newError(404, 'No images were found');
    }
    return images;
  },
  * create(req) {
    const image = new Image(req.body);
    const result = yield image.save();
    return result;
  },
  * update(req) {
    const image = req.body;
    const result = yield Image.findOneAndUpdate({ _id: req.params.imageId }, image);
    return result;
  },
  * delete(req) {
    const result = yield Image.remove({ _id: req.params.imageId });
    return result;
  }
};
