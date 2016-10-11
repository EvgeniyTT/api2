require('dotenv').config({path: '.env'});
const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;
const assert = chai.assert;
const imageModule = require('../../src/controllers/images');
const co = require('co');

function* saveImage() {
  const request = {};
  request.body = {
    name: 'name',
    description: 'description',
    data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwk',
    dateAdded: new Date(),
    thumbnailData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwk',
    thumbnailX: 27,
    thumbnailY: 44,
    thumbnailWidth: 567,
    thumbnailHeight: 334,
  };
  const resultDb = yield imageModule.create(request);
  return [request.body, resultDb];
}

function* deleteImage(imageId) {
  const request = {};
  request.params = {};
  request.params.imageId = imageId;
  const deleteResult = yield imageModule.delete(request);
  return deleteResult;
}

describe('imageModule', function() {
  it('positive test: check image document is saved in DB', co.wrap(function*() {
    const [image, resultDb] = yield saveImage();
    Object.keys(image).forEach((key) => {
      if (['data, thumbnailData'].indexOf(key) > 0) {
        expect(resultDb[key]).to.equal(image[key]);
      }
    });
    const deleteResult = yield deleteImage(resultDb._id);
    expect(deleteResult.result.ok).to.equal(1);
    expect(deleteResult.result.n).to.equal(1);
  }));
  it('positive test: check image file is saved on the server', co.wrap(function*() {
    const [image, resultDb] = yield saveImage();
    const imageID = resultDb._id.toString();
    const imagePath = `${imageID.slice(0,8)}/${imageID.slice(8,16)}/${imageID.slice(16, 24)}.jpg`;
    expect(`${process.env.ORIGIN_DIR}/${imagePath}`).to.be.a.file();
    expect(`${process.env.THUMBNAILS_DIR}/${imagePath}`).to.be.a.file();

    yield deleteImage(resultDb._id);
    expect(`${process.env.ORIGIN_DIR}/${imagePath}`).to.not.be.a.path();
    expect(`${process.env.THUMBNAILS_DIR}/${imagePath}`).to.not.be.a.path();
  }));

});
