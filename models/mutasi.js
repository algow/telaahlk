const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MutasiSchema = new Schema({
  kategori: String,
  desc: String,
  ledger: String,
  akuns: Array
});

module.exports = mongoose.model('Mutasi', MutasiSchema);