const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AkrualkasSchema = new Schema({
  kategori: String,
  desc: String,
  ledger: String,
  akuns: Array
});

module.exports = mongoose.model('Akrualkas', AkrualkasSchema);