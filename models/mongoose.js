const mongoose = require('mongoose');

const dbConnection = () => {
  mongoose.connect(
    'mongodb://localhost:27017/rekon_dev', 
    { 
      useNewUrlParser: true,
      useUnifiedTopology: true
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', () => {
    console.log('Mongodb connected')
  });
}

module.exports = dbConnection;