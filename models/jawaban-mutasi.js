const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JawabanMutasi = new Schema({
  kdkppn: String,
  bulan: Number,
  kategori: String,
  desc: String,
  ledger: String,
  akun: String,
  nilai: Number
});

module.exports = mongoose.model('JawabanMutasi', JawabanMutasi);