const readline = require('readline');
const fs = require('fs');

const readInterface = (path, filename) => {
  const read = readline.createInterface({
    input: fs.createReadStream(path + filename),
    console: false
  });

  return read;
};

module.exports = readInterface;