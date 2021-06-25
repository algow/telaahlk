const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SatkerUploadSchema = new Schema({
  kdkppn: String,
  file: String,
  timestamp: String
});

module.exports = mongoose.model('SatkerUpload', SatkerUploadSchema);