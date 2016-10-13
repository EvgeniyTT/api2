
process.env.MONGODB_URI = 'mongodb://localhost:27017/imageGalleryTest';

require('dotenv').config({path: '.env'});
require('co-mocha');
