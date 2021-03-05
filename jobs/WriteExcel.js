class WriteExcel {
  #rowData;
  #writeStream;

  
  constructor(rowData) {
    this.#rowData = rowData;

    const timestamp = Date.now();
    const excelName = rowData.kdkppn + '_' + timestamp + '.xls';

    this.#writeStream = fs.createWriteStream('./publics/xls/'+ excelName, {flags: 'a'});
  }


  async writeHeaderToExcel(header) {

  }


  async writeLineToExcel(row) {

  }
}

module.exports = WriteExcel;