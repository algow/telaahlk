const readInterface = require('./read-interface');
const writeInterface = require('./write-interface');
const { lineIsData, parse } = require('./parser');
const { writeExcelHeader, writeExcel } = require('./write-excel');
const { getFilterData } = require('../../redis/storage');
const TrieHelper = require('../caching/trie-helpers');
const telaah = require('../telaah');
const { jawabanSeeder, accrualVsCashSeeder, mutasiAkrualKas } = require('../../models/seeder');
const { finishingStuffs } = require('../telaah/utils');


class StreamProcessing {
  constructor(queue) {
    this.__queue = queue;
    this.__satker = '';
    this.__kdkppn = this.__queue[0].kdkppn;
    this.__bulan = this.__queue[0].bulan;
    this.__excelName = this.__kdkppn + '_' + Date.now() + '.xls';
  }

  async init() {
    // Fetch filters trie from redis
    this.__filters = await getFilterData();

    await jawabanSeeder(this.__kdkppn, this.__bulan);
    await accrualVsCashSeeder(this.__kdkppn, this.__bulan);
    await mutasiAkrualKas(this.__kdkppn, this.__bulan);
  }

  async run(i=0) {
    const readLine = readInterface(this.__queue[i]);
    const writeLine = writeInterface(this.__excelName);

    // instantiate TrieNode object here
    const filterTrie = new TrieHelper(this.__filters);

    // Jika file pertama yang diiterate, maka tulis header
    if(i === 0) {
      writeExcelHeader(writeLine);
    }

    readLine.on('line', line => {
      // line string to array
      const oneLineArr = line.split(/\s{2,}/);

      // get ledger name by mutating this.queue
      this.__getLedgerName(oneLineArr, this.__queue[i]);

      // get kode satker of line by mutating this.satker
      this.__getKodeSatker(oneLineArr);

      // parse row as relevant object
      // if row is not relevant return empty object
      const parsedRow = parse(this.__queue[i], oneLineArr, this.__satker);

      // Jika row relevan dan tidak kosong
      if(Object.keys(parsedRow).length > 0) {
        // write excel
        writeExcel(writeLine, parsedRow);

        // find analyzee
        let filterExist = [];

        if(this.__queue[i].ledger !== 'Accrual_BANK') {
          filterExist = filterTrie.getFilter(parsedRow.akun, this.__queue[i].ledger);
        }

        if(filterExist.length > 0) {
          telaah(parsedRow, filterExist);
        }
      }
    });

    readLine.on('close', () => {
      console.log('closed');

      finishingStuffs(this.__kdkppn, this.__bulan, this.__excelName);

      if(i < this.__queue.length - 1) {
        this.run(i+1);
      }
    });
  }

  __getLedgerName(rowData, queueData) {
    if(this.__queue[queueData['index']].ledger.split('_').length < 2) {
      if(rowData[1] === 'Buku Besar:' || rowData[1] === 'Ledger:') {
        this.__queue[queueData['index']].ledger += rowData[2].split(' ')[1];
      }
    
      if(rowData[2] === 'Deskripsi AKUN' || rowData[2] === 'AKUN Description') {
        this.__queue[queueData['index']].ledger += '_' + rowData[0];
      }
    }
  }
  
  __getKodeSatker(oneLineArr) {
    if(lineIsData(oneLineArr)) {
      if(oneLineArr[0] === '') {
        this.__satker = this.__satker;
      } else {
        this.__satker = oneLineArr[0];
      }
    }
  }
}

module.exports = StreamProcessing;