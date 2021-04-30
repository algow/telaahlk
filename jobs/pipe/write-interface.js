const fs = require('fs');

const writeInterface = excelName => {
  const write = fs.createWriteStream('./publics/xls/'+ excelName, {flags: 'a'});

  return write;
}

module.exports = writeInterface;
