require('dotenv').config({path: '.env'});
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;
const assert = chai.assert;
const app = require('../../src/app');
const co = require('co');

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

let fifthImage = {};

describe('image controller - positive flow: ', function() {
  it('save image', function(done) {
    request(app)
      .post('/images')
      .send(image)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        image._id = res.body._id;
        Object.keys(image).forEach((key) => {
          if (['data, thumbnailData'].indexOf(key) > 0) {
            expect(res.body[key]).to.equal(image[key]);
          }
        });
        const imageID = res.body._id.toString();
        image.imagePath = `${imageID.slice(0,8)}/${imageID.slice(8,16)}/${imageID.slice(16, 24)}.jpg`;
        expect(`${process.env.ORIGIN_DIR}/${image.imagePath}`).to.be.a.file();
        expect(`${process.env.THUMBNAILS_DIR}/${image.imagePath}`).to.be.a.file();
        done();
      });
  });
  it('get image after save', function(done) {
    request(app)
      .get(`/images/${image._id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        Object.keys(image).forEach((key) => {
          if (['data, thumbnailData'].indexOf(key) > 0) {
            expect(res.body[key]).to.equal(image[key]);
          }
        });
        done();
      });
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
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        Object.keys(image).forEach((key) => {
          if (['data, thumbnailData'].indexOf(key) > 0) {
            expect(res.body[key]).to.equal(image[key]);
          }
        });
        done();
      });
  });
  it('get image after update', function(done) {
    request(app)
      .get(`/images/${image._id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        Object.keys(image).forEach((key) => {
          if (['data, thumbnailData'].indexOf(key) > 0) {
            expect(res.body[key]).to.equal(image[key]);
          }
        });
        done();
      });
  });
  it('remove image', function(done) {
    request(app)
      .delete(`/images/${image._id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.ok).to.equal(1);
        expect(res.body.n).to.equal(1);
        expect(`${process.env.ORIGIN_DIR}/${image.imagePath}`).to.not.be.a.path();
        expect(`${process.env.THUMBNAILS_DIR}/${image.imagePath}`).to.not.be.a.path();
        done();
      });
  });
  it('check default limit value is 10', function(done) {
    request(app)
      .get('/images')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.length).to.equal(10);
        fifthImage = res.body[4];
        done();
      });
  });
  it('check custom limit value', function(done) {
    request(app)
      .get('/images/5/10')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.length).to.equal(5);
        expect(res.body[0]).to.equal(fifthImage);
        done();
      });
  });
});
