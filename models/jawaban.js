const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JawabanSchema = new Schema({
  kdkppn: String,
  bulan: Number,
  pertanyaan_id: Schema.Types.ObjectId,
  jawaban: Boolean
});

module.exports = mongoose.model('Jawaban', JawabanSchema);