const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DoubleFilterSchema = new Schema({
  pertanyaan_id: Schema.Types.ObjectId,
  ledger: String,
  nomor: Number,
  left: {
    akuns: Array,
    value: Number
  },
  right: {
    akuns: Array,
    value: Number
  }
});

module.exports = mongoose.model('DoubleFilter', DoubleFilterSchema);