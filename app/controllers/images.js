const newError = require('../lib/errorFactory');
const db = require('../lib/mongo.js');
const fs = require('fs');
const request = require('request');

const Image = db.model('Image');

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
    if (!req.params.skip) {
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
    function decodeBase64Image(dataString) {
      const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const response = {};
      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      console.log('***********');
      const imageExtension = response.type.split('/')[1];
      image.name = [image.name, imageExtension].join('.');
      console.log(image.name);
      console.log('***********');

      response.data = new Buffer(matches[2], 'base64');
      return response;
    }
    const imageBuffer = decodeBase64Image(image.data);
    fs.writeFile(`../app/assets/images/${image.name}`, imageBuffer.data, (err) => {
      if(err) {
        console.log(err);
      }
      console.log("The file was saved!");
    });

    const currentDate = new Date();
    const imageModel = {
      src: image.name,
      description: image.description,
      dateAdded: [currentDate.getMonth() + 1, currentDate.getDate(), currentDate.getFullYear()].join('/')
    };
    const imageDB = new Image(imageModel);
    const result = yield imageDB.save();
    return result;

    // let filename;
    // //write file by link
    // console.log(req.body);
    // if (req.body.src) {
    //   const stream = request(req.body.src);
    //   filename = req.body.src.split('/').slice(-1)[0];
    //   const writeStream = fs.createWriteStream(`../app/assets/images/${filename}`);
    //   stream.on('data', (data) => {
    //     writeStream.write(data)
    //   });
    //   stream.on('end', () => {
    //     writeStream.end();
    //   });
    //   stream.on('error', (err) => {
    //     console.log('something is wrong :( ');
    //     writeStream.close();
    //   });
    // }
    // // write file from dropzone
    // if (req.files) {
    //   console.log(req.files);
    //
    //   filename = req.files.file.name;
    //   const writeStream = fs.createWriteStream(`../app/assets/images/${filename}`);
    //   writeStream.write(req.files.file.data)
    //   writeStream.end();
    // }
    // // write data to DB
    // const currentDate = new Date();
    // const image = {
    //   src: filename,
    //   description: req.body.description || '',
    //   dateAdded: [currentDate.getMonth() + 1, currentDate.getDate(), currentDate.getFullYear()].join('/')
    // };
    // const imageDB = new Image(image);
    // const result = yield imageDB.save();
    // return result;
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
