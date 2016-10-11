require('dotenv').config({path: '.env'});
require('co-mocha');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;
const assert = chai.assert;
const app = require('../../src/app');
const imageModule = require('../../src/controllers/images');

describe('image controller - CRUD flow with one image:', function() {
  let image = {};
  let fifthImage = {};
  before(() => {
    image = {
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
  });
  it('save image', function(done) {
    request(app)
      .post('/images')
      .send(image)
      .expect(200)
      .expect(res => {
        image._id = res.body._id;
        Object.keys(image).forEach(function(key) {
          if (['data, thumbnailData'].indexOf(key) > 0) {
            expect(res.body[key]).to.equal(image[key]);
          }
        });
        const imageID = res.body._id.toString();
        image.imagePath = `${imageID.slice(0,8)}/${imageID.slice(8,16)}/${imageID.slice(16, 24)}.jpg`;
        expect(`${process.env.ORIGIN_DIR}/${image.imagePath}`).to.be.a.file();
        expect(`${process.env.THUMBNAILS_DIR}/${image.imagePath}`).to.be.a.file();
      })
      .end(done);
  });
  it('get image after save', function(done) {
    request(app)
      .get(`/images/${image._id}`)
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
  it('update image', function(done) {
    image.name = 'TESTnameUpdatedTEST';
    image.description = 'TESTdescriptionUpdatedTEST';
    image.thumbnailX = 44;
    image.thumbnailY = 22;
    image.thumbnailWidth = 761;
    image.thumbnailHeight = 137;
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
  it('get image after update', function(done) {
    request(app)
      .get(`/images/${image._id}`)
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
  it('remove image', function(done) {
    request(app)
      .delete(`/images/${image._id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.ok).to.equal(1);
        expect(res.body.n).to.equal(1);
        expect(`${process.env.ORIGIN_DIR}/${image.imagePath}`).to.not.be.a.path();
        expect(`${process.env.THUMBNAILS_DIR}/${image.imagePath}`).to.not.be.a.path();
      })
      .end(done);
  });
  it('check default limit value is 10', function(done) {
    request(app)
      .get('/images')
      .expect(200)
      .expect(res => {
        expect(res.body.length).to.equal(10);
        fifthImage = res.body[4];
      })
      .end(done);
  });
  it('check custom limit value', function(done) {
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

describe('image controller - negative flow: ', function() {
  this.timeout(5000);
  let image = {};
  let testImagesIds = [];
  before(function* add120Images() {
    image = {
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
    const request = {};
    for (let i = 0; i < 120; i++) {
      request.body = image;
      request.body.name += i;
      let result = yield imageModule.create(request);
      testImagesIds.push(result._id)
    }
  });
  it('user tries to get more than 100 images in a one request', function(done) {
    request(app)
      .get('/images/0/101')
      .expect(200)
      .expect(res => {
        expect(res.body.length).to.equal(100);
      })
      .end(done);
  });
  after(function* delete120Image() {
    const request = {};
    request.params = {};
    for (let i = 0; i < 120; i++) {
      request.params.imageId = testImagesIds[i];
      yield imageModule.delete(request);
    }
  });
});