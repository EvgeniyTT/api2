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

/////  THIS WORKS!!!!!!!!!
    var stream = request('http://i.imgur.com/dmetFjf.jpg');
    var writeStream = fs.createWriteStream('test.jpg')

    stream.on('data', function(data) {
      writeStream.write(data)
    });

    stream.on('end', function() {
      writeStream.end();
    });

    stream.on('error', function(err) {
      console.log('something is wrong :( ');
      writeStream.close();
    });
/////  THIS WORKS!!!!!!!!!


/////  THIS WORKS!!!!!!!!!
    var stream2 = req;
    var writeStream2 = fs.createWriteStream('test3.jpg')

    stream2.on('data', function(data) {
      writeStream2.write(data)
    });

    stream2.on('end', function() {
      writeStream2.end();
    });

    stream2.on('error', function(err) {
      console.log('something is wrong :( ');
      writeStream2.close();
    });
/////  THIS WORKS!!!!!!!!!

        // function decodeBase64Image(dataString) {
        //   console.log(dataString);
        //   var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        //     response = {};
        //
        //   if (matches.length !== 3) {
        //     return new Error('Invalid input string');
        //   }
        //
        //   response.type = matches[1];
        //   response.data = new Buffer(matches[2], 'base64');
        //
        //   return response;
        // }

        // var imageBuffer = decodeBase64Image(data);
        // console.log(imageBuffer);

    // let body = [];
    // req.on('data', (chunk) => {
    //   body.push(chunk);
    // }).on('end', () => {
    //   body = Buffer.concat(body).toString();
    //   console.log('BODY');
    //   let imageBuffer = decodeBase64Image(body);
    //   fs.writeFile('test.jpg', imageBuffer.data, (err) => { console.log(err) });
    //   // at this point, `body` has the entire request body stored in it as a string
    //
    //   const tempFile = fs.createWriteStream('../filee6.jpg');
    //   console.log('HERE');
    //   tempFile.on('open', (fd) => {
    //     console.log('OPEN');
    //     tempFile.write(body);
    //     tempFile.end();
    //     })
    // });



    // req.on('data', function(chunk) {
    //   console.log('/////////');
    //   console.log(chunk);
    //   console.log('/////////');
    //     // req.rawBody += chunk;
    // });

    // function download(url, tempFilepath, filepath, callback) {
    //
    //     var tempFile = fs.createWriteStream(tempFilepath);
    //     tempFile.on('open', function(fd) {
    //         http.request(url, function(res) {
    //             res.on('data', function(chunk) {
    //                 tempFile.write(chunk);
    //             }).on('end', function() {
    //                 tempFile.end();
    //                 fs.renameSync(tempFile.path, filepath);
    //                 return callback(filepath);
    //             });
    //         });
    //     });
    // }
    // const writeStream = fs.createWriteStream('../filee4.jpg');
    //
    // req.pipe(writeStream, {end: false});
    // req.on('end',  ()  {
    //   res.end('chunk received');
    // });

    // tempFile.on('open', (fd) => {
    //   req.on('data', (chunk) => {
    //       console.log('CHUNK');
    //       tempFile.write(chunk);
    //   })
    //   .on('end', () => {
    //       console.log('END');
    //       tempFile.end();
    //       // fs.renameSync(tempFile.path, '../filee4');
    //     })
    //   })

    // req.on('data', function(chunk) {
    //   console.log('/////////');
    //   console.log(chunk);
    //   console.log('/////////');
    //     // req.rawBody += chunk;
    // });

    // if(req.busboy) {
    //   req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    //    console.log('-----------------**********-------------');
    //    console.log(filename);
    //    console.log(mimetype);
    //
    //        fs.writeFile('filename.jpeg', file, function (err) {
    //          if (err) {
    //            console.log('ERROR');
    //            console.log(err);
    //            throw newError(400, 'Bad Data');
    //          }
    //        })
    //        console.log('-----------------**********-------------');
    //       })
    //
    //   .on('field', function(key, value, keyTruncated, valueTruncated) {
    //   })
    //   .on('end', function() {
    //     console.log('END');
    //   })
    //   .on('finish', function(){
    //     console.log('FINISH');
    //   })
    //
    //   req.pipe(req.busboy);
    // }

    // console.log('///////////////');
    // // const image = new Image(req.body);
    // // const result = yield image.save();
    // // return result;
    // return "Ok";
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
