const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  kdkppn: String,
  nama: String,
  djp: String,
  djbc: String,
  djppr: String,
  djpk: String
});

module.exports = mongoose.model('User', UserSchema);