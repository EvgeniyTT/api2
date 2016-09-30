const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const imageSchema = new Schema({
  name: String,
  description: String,
  // data: String,
  dateAdded: Date,
  // thumbnailData: String,
  thumbnailX: Number,
  thumbnailY: Number,
  thumbnailWidth: Number,
  thumbnailHeight: Number
});

mongoose.model('Image', imageSchema, 'images');
