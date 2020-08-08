const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PertanyaanSchema = new Schema({
  ledger: String,
  nomor: Number,
  pertanyaan: String
});

module.exports = mongoose.model('Pertanyaan', PertanyaanSchema);