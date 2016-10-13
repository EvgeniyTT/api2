require('dotenv').config({path: '.env'});
require('co-mocha');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;
const assert = chai.assert;
const app = require('../../src/app');
const db = require('../../src/lib/mongo.js');
const fsp = require('fs-promise');
const mkdirpPromise = require('mkdirp-promise');
const Image = db.model('Image');

const imageModule = require('../../src/controllers/images');
const originDir = process.env.ORIGIN_DIR;
const thumbnailsDir = process.env.THUMBNAILS_DIR;

let testImagesIds = [];
let imageDocument = {};
function* createImage() {
  const image = {
    name: 'TESTnameTEST',
    description: 'TESTdescriptionTEST',
    data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwk',
    dateAdded: new Date(),
    thumbnailData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwk',
    thumbnailX: 27,
    thumbnailY: 44,
    thumbnailWidth: 567,
    thumbnailHeight: 334,
  };
  imageDocument = new Image(image);
  yield imageDocument.save();
  const imageID = imageDocument._id.toString();
  const fileDir = `${imageID.slice(0,8)}/${imageID.slice(8,16)}`;
  yield mkdirpPromise(`${originDir}/${fileDir}`);
  yield mkdirpPromise(`${thumbnailsDir}/${fileDir}`);
  yield fsp.writeFile(`${originDir}/${fileDir}/${imageID.slice(16, 24)}.jpg`,{});
  yield fsp.writeFile(`${thumbnailsDir}/${fileDir}/${imageID.slice(16, 24)}.jpg`,{});
  testImagesIds.push(imageDocument._id);
}

describe('image controller - positive tests:', function() {
  let fifthImage = {};
  let req = {};
  beforeEach( createImage );
  it('should get image', function(done) {
    request(app)
      .get(`/images/${imageDocument._id}`)
      .expect(200)
      .expect(res => {
        Object.keys(imageDocument).forEach(function(key) {
          if (['data, thumbnailData'].indexOf(key) > 0) {
            expect(res.body[key]).to.equal(imageDocument[key]);
          }
        });
      })
      .end(done);
  });
  it('should update image', function(done) {
    let image = {
      _id : testImagesIds[0],
      name : 'TESTnameUpdatedTEST',
      description : 'TESTdescriptionUpdatedTEST',
      thumbnailX : 44,
      thumbnailY : 22,
      thumbnailWidth : 761,
      thumbnailHeight : 137
    }
    request(app)
      .put(`/images/${image._id}`)
      .send(image)
      .expect(200)
      .expect(res => {
        Object.keys(image).forEach(function(key) {
          if (['data, thumbnailData'].indexOf(key) > 0) {
            expect(res.body[key]).to.equal(image[key]);
          }
        });
      })
      .end(done);
  });
  it('should remove image', function(done) {
    request(app)
      .delete(`/images/${imageDocument._id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.ok).to.equal(1);
        expect(res.body.n).to.equal(1);
        const imageID = imageDocument._id.toString();
        const imagePath = `${imageID.slice(0,8)}/${imageID.slice(8,16)}/${imageID.slice(16, 24)}.jpg`;
        expect(`${process.env.ORIGIN_DIR}/${imagePath}`).to.not.be.a.path();
        expect(`${process.env.THUMBNAILS_DIR}/${imagePath}`).to.not.be.a.path();
      })
      .end(done);
  });
  it('should check default limit value is 10', function(done) {
    request(app)
      .get('/images')
      .expect(200)
      .expect(res => {
        expect(res.body.length).to.equal(10);
        fifthImage = res.body[4];
      })
      .end(done);
  });
  it('should check custom limit value', function(done) {
    request(app)
      .get('/images/4/5')
      .expect(200)
      .expect(res => {
        expect(res.body.length).to.equal(5);
        expect(JSON.stringify(res.body[0])).to.equal(JSON.stringify(fifthImage));
      })
      .end(done);
  });
});

describe('image controller - positive flow: ', function() {
  this.timeout(5000);
  let image = {};
  before(function* add120Images() {
    for (let i = 0; i < 120; i++) {
      createImage();
    }
  });
  it('should return 100 images if user tries to get more than 100 in a one request', function(done) {
    request(app)
      .get('/images/0/101')
      .expect(200)
      .expect(res => {
        expect(res.body.length).to.equal(100);
      })
      .end(done);
  });
});

after(function* deleteImages() {
  const request = {};
  request.params = {};
  for (let i = 0; i < testImagesIds.length; i++) {
    request.params.imageId = testImagesIds[i];
    yield imageModule.delete(request);
  }
});
