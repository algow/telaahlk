const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JawabanAkrualkasSchema = new Schema({
  kdkppn: String,
  bulan: Number,
  kategori: String,
  desc: String,
  ledger: String,
  akun: String,
  nilai: Number
});

module.exports = mongoose.model('JawabanAkrualkas', JawabanAkrualkasSchema);