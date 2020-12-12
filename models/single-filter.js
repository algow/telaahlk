const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SingleFilterSchema = new Schema({
  pertanyaan_id: Schema.Types.ObjectId,
  ledger: String,
  nomor: Number,
  akun: String,
  filter: String,
  must: String,
  must_not: String,
  at: String,
  position: String,
  bank: String
});

module.exports = mongoose.model('SingleFilter', SingleFilterSchema);