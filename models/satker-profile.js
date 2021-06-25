const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SatkersSchema = new Schema({
  kdkppn: String,
  kode_satker: String,
  nama_satker: String,
  email: String,
  telpon: String
});

module.exports = mongoose.model('Satkers', SatkersSchema);