require('dotenv').config({path: '.env'});
require('co-mocha');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;
const assert = chai.assert;
const app = require('../../src/app');
const imageModule = require('../../src/controllers/images');

let testImagesIds = [];

describe('image controller - negative flow: ', function() {
  it('should return error if bad image data (not base64 dataurl) is provided', function(done) {
    const image = {
      name: 'TESTnameTEST',
      description: 'TESTdescriptionTEST',
      data: 'BAD DATA',
      dateAdded: new Date(),
      thumbnailData: 'BAD DATA',
      thumbnailX: 27,
      thumbnailY: 44,
      thumbnailWidth: 567,
      thumbnailHeight: 334,
    };
    request(app)
      .post('/images')
      .send(image)
      .expect(404)
      .expect(res => {
        expect(res.error.text).to.equal('{"message":"Invalid image data url","error":{"status":404}}');
      })
      .end(done);
  });
  it('should return error if image is gotten by bad ID', function(done) {
    request(app)
      .get('/images/bad_id')
      .expect(400)
      .expect(res => {
        expect(res.error.text).to.equal('{"message":"CastError: Cast to ObjectId failed for value \\"bad_id\\" at path \\"_id\\"","error":{"status":400}}');
      })
      .end(done);
  });
  it('should return error if image is not found', function(done) {
    request(app)
      .get('/images/57ee25de0d656772e4eaa999')
      .expect(400)
      .expect(res => {
        expect(res.error.text).to.equal('{"message":"Image was not found","error":{"status":400}}');
      })
      .end(done);
  });
  it('should return error if there are no images were returned in a list', function(done) {
    request(app)
      .get('/images/0/0')
      .expect(400)
      .expect(res => {
        expect(res.error.text).to.equal('{"message":"No images were returned. Please check you do not set limit to 0 and images are exist","error":{"status":400}}');
      })
      .end(done);
  });
});
