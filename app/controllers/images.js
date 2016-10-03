const newError = require('../lib/errorFactory');
const db = require('../lib/mongo.js');
const fs = require('fs');
const mkdirp = require('mkdirp');

const Image = db.model('Image');

const originDir = process.env.ORIGIN_DIR;
const thumbnailsDir = process.env.THUMBNAILS_DIR;

module.exports = {
  * getOne(req) {
    let result;
    try {
      result = yield Image.findOne({ _id: req.params.imageId });
    } catch (e) {
      throw newError(400, e);
    }
    if (!result) {
      throw newError(404, 'Image was not found');
    }
    const prevImage = yield Image.findOne({ _id: { $lt: req.params.imageId } }).sort({ _id: -1 });
    const nextImage = yield Image.findOne({ _id: { $gt: req.params.imageId } }).sort({ _id: 1 });
    result._doc.prevImageId = prevImage ? prevImage._id : null;
    result._doc.nextImageId = nextImage ? nextImage._id : null;
    return result;
  },
  * list(req) {
    let images;
    if (!req.params.limit) {
      images = yield Image.find();
    } else {
      images = yield Image.find().sort({ _id: 1 }).skip(parseInt(req.params.skip)).limit(parseInt(req.params.limit));
    }
    if (images.length === 0) {
      throw newError(404, 'No images were found');
    }
    return images;
  },
  * create(req) {
    const image = req.body;
    const imageDB = new Image(image);
    const result = yield imageDB.save();

    const imageID = result._id.toString();
    const fileDir = `${imageID.slice(0,8)}/${imageID.slice(8,16)}`;
    mkdirp.sync(`${originDir}/${fileDir}`);
    mkdirp.sync(`${thumbnailsDir}/${fileDir}`);
    try {
      const imageBuffer = decodeBase64Image(image.data);
      fs.writeFileSync(`${originDir}/${fileDir}/${imageID.slice(16, 24)}.jpg`);

      const thumbnailBuffer = decodeBase64Image(image.thumbnailData);
      fs.writeFileSync(`${thumbnailsDir}/${fileDir}/${imageID.slice(16, 24)}.jpg`, thumbnailBuffer.data);
    } catch (err) {
      const deleteResult = yield Image.remove({ _id: imageID });
      throw err;
    }

    function decodeBase64Image(dataString) {
      const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const response = {};
      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      const imageExtension = response.type.split('/')[1];
      image.name = [image.name, imageExtension].join('.');
      response.data = new Buffer(matches[2], 'base64');
      return response;
    }
    return result;
  },
  * update(req) {
    const image = req;
    const result = yield Image.findOneAndUpdate({ _id: req.params.imageId }, image);
    return result;
  },
  * delete(req) {
    const result = yield Image.remove({ _id: req.params.imageId });
    return result;
  }
};
