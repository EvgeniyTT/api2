const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const imageSchema = new Schema({
  src: String,
  description: String,
  dateAdded: Date
});

mongoose.model('Image', imageSchema, 'images');
