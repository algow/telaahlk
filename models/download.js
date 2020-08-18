const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DownloadSchema = new Schema({
  kdkppn: String,
  bulan: Number,
  file: String
});

module.exports = mongoose.model('Download', DownloadSchema);