const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JawabanSchema = new Schema({
  kdkppn: String,
  bulan: Number,
  pertanyaan_id: Schema.Types.ObjectId,
  jawaban: Boolean,
  left: Number,
  right: Number,
  filter: String,
  sign: String,
  kesalahan: Array
});

module.exports = mongoose.model('Jawaban', JawabanSchema);