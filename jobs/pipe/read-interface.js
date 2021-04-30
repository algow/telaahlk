const readline = require('readline');
const fs = require('fs');

const readInterface = queueData => {
  const read = readline.createInterface({
    input: fs.createReadStream('./publics/text/' + queueData.filename),
    console: false
  });

  return read;
};

module.exports = readInterface;