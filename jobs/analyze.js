const readline = require('readline');
const fs = require('fs');
const WriteExcel = require('./WriteExcel');


class Analyzer {
  #ledgerName = '';
  #queueData;


  constructor(queueData) {
    this.#queueData = queueData;
  }

  
  doAnalyze() {
    for (const queue of this.#queueData) {

    }

    this.#queueData.forEach(queue => {
      const readInterface = readline.createInterface({
        input: fs.createReadStream('./publics/text/' + queue.filename),
        console: false
      });

      readInterface.on('line', line => {
        const oneLineArr = line.split(/\s{2,}/);

        // If ledger name haven't been found
        if(queue.ledger.split('_').length < 2) {
          this.#getLedgerName(oneLineArr, queue);
        }
        // const parsedRow = parseTxtLine(line, queue);
        // writeLineToExcel(parsedRow);
      });
      console.log(this.#queueData);
    });
  }


  #getLedgerName(rowData, queueData) {
    if(rowData[1] === 'Buku Besar:' || rowData[1] === 'Ledger:') {
      this.#queueData[queueData['index']].ledger += rowData[2].split(' ')[1];
    }

    if(rowData[2] === 'Deskripsi AKUN' || rowData[2] === 'AKUN Description') {
      this.#queueData[queueData['index']].ledger += '_' + rowData[0];
    }
  }


  #parseTxtLine() {

  }
}


module.exports = Analyzer;


// const analyze = async queueData => {
//   queueData.forEach((queue, index) => {
//     queue.index = index;

//     parseTxtFile(queue);
//   });
// }

// // module.exports = analyze;


// const parseTxtFile = fileData => {
//   const readInterface = readline.createInterface({
//     input: fs.createReadStream('./publics/text/' + fileData.filename),
//     console: false
//   });

//   readInterface.on('line', line => {
//     const parsedRow = parseTxtLine(line, fileData);
//     // writeLineToExcel(parsedRow);
//   });
// }


// const parseTxtLine = (stringLine, fileData) => {
//   let rowData = {
//     kppn: fileData.kdkppn,
//     bulan: fileData.bulan,
//     ledger: '',
//     satker_1: '',
//     satker: '',
//     akun_1: '',
//     akun_2: '',
//     akun_3: '',
//     akun_4: '',
//     akun_5: '',
//     akun: '',
//     deskripsi: '',
//     saldo_awal: 0,
//     aktivitas: 0,
//     saldo_akhir: 0
//   };

//   const oneLineArr = stringLine.split(/\s{2,}/);

//   if(Array.isArray(oneLineArr) && oneLineArr.length > 1) {
//     console.log(oneLineArr);
//   }
  
//   return rowData;
// }