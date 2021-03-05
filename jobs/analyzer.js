const readline = require('readline');
const fs = require('fs');
const storage = require('../redis/storage');
const { jawabanSeeder, accrualVsCashSeeder } = require('../models/seeder');
const SingleFilterModel = require('../models/single-filter');
const JawabanModel = require('../models/jawaban');
const UserModel = require('../models/user');
const JawabanAkrualkasModel = require('../models/jawaban-akrualkas');
const DownloadModel = require('../models/download');

class Analyzer{
  constructor(){
    this.singleFilter = [];
    this.akrualkas = [];
    this.profilKppn = {
      djp: '',
      djbc: '',
      djppr: '',
      djpk: ''
    }
  }

  async analyze() {
    let kdkppn = '';
    let bulan = 0;
    let analyzeeFiles = [];
  
    try {
      this.singleFilter = await this.__singeFilter();
      // console.log(this.singleFilter);
      // await storage.setProccess('yes');
      const queueData = await storage.popQueue();

      kdkppn = queueData.kdkppn;
      bulan = queueData.bulan;
      analyzeeFiles = queueData.files;

      const data = await UserModel.find({kdkppn: kdkppn});

      this.profilKppn = {
        djppr: data[0].djppr,
        djpk: data[0].djpk,
        djp: data[0].djp,
        djbc: data[0].djbc
      }
    } catch (error) {
      console.log(error);
    }

    try {
      await jawabanSeeder(kdkppn, bulan);
      this.akrualkas = await accrualVsCashSeeder(kdkppn, bulan);
    } catch (error) {
      console.log(error);
    }

    console.log('seeding sukses');
    const timestamp = Date.now();
  
    const excelName = kdkppn + '_' + timestamp + '.xls';

    analyzeeFiles.forEach((file, index) => {
      this.__parser(index, kdkppn, bulan, file, excelName);
    });

    try {
      await DownloadModel.deleteMany({kdkppn, bulan});
      const perbandingan = await JawabanModel.find({
        kdkppn,
        bulan,
        filter: 'perbandingan'
      });
      
      this.__jawabanPerbandingan(perbandingan);
    } catch (error) {
      console.log(error, kdkppn);
    }

    const download = new DownloadModel({
      kdkppn,
      bulan,
      file: excelName
    });
    download.save();
  };
  
  async __singeFilter() {
    let singleFilter = [];
    let singleFilterGrouped = {
      Accrual_SATKER: [],
      Cash_SATKER: [],
      Cash_BANK: []
    };

    try {
      singleFilter = await SingleFilterModel.find({});
    } catch (error) {
      console.log(error);
    }

    singleFilter.forEach(element => {
      singleFilterGrouped[element['ledger']].push(element);
    });

    return singleFilterGrouped;
  }

  __parser(index, kdkppn, bulan, filename, excelName) {
    const KPPN = kdkppn;
    let LEDGER = '';

    let schema = {
      kppn: '',
      bulan: 0,
      ledger: '',
      satker_1: '',
      satker: '',
      akun_1: '',
      akun_2: '',
      akun_3: '',
      akun_4: '',
      akun_5: '',
      akun: '',
      deskripsi: '',
      saldo_awal: 0,
      aktivitas: 0,
      saldo_akhir: 0
    };
  
    const readInterface = readline.createInterface({
      input: fs.createReadStream('./publics/text/' + filename),
      console: false
    });
    
    const writeStream = fs.createWriteStream('./publics/xls/'+ excelName, {flags: 'a'});

    if(index === 0){
      writeStream.write(
        "'" + 'KPPN' + '\t' + 
        'LEDGER' + '\t' + "'" + 
        'BANK/SATKER 1' + '\t' + "'" + 
        'BANK/SATKER' + '\t' + "'" + 
        'AKUN 1' + '\t' + "'" + 
        'AKUN 2' + '\t' + "'" + 
        'AKUN 3' + '\t' + "'" + 
        'AKUN 4' + '\t' + "'" + 
        'AKUN 5' + '\t' + "'" + 
        'AKUN 6' + '\t' + 
        'DESKRIPSI' + '\t' + 
        'SALDO AWAL' + '\t' + 
        'AKTIVITAS' + '\t' + 
        'SALDO AKHIR' + '\n'
      );  
    }
    
    readInterface.on('line', line => {
      const oneLine = line.split(/\s{2,}/);
  
      if(Array.isArray(oneLine) && oneLine.length > 1) {
        schema.kppn = KPPN;
        schema.bulan = bulan;
  
        if(LEDGER.split('_').length < 2) {
          if(oneLine[1] === 'Buku Besar:' || oneLine[1] === 'Ledger:') {
            LEDGER += oneLine[2].split(' ')[1];
          }
      
          if(oneLine[2] === 'Deskripsi AKUN' || oneLine[2] === 'AKUN Description') {
            LEDGER += '_' + oneLine[0];
          }
      
          schema.ledger = LEDGER;
        }
  
        if(/^[0-9]{6}/.test(oneLine[1])){
  
          if(oneLine[0] === ''){
            schema.satker_1 = schema.satker.substr(0,1);
            schema.satker = schema.satker;
          } else {
            schema.satker_1 = oneLine[0].substr(0,1);
            schema.satker = oneLine[0];
          }
  
          schema.akun_1 = oneLine[1].substr(0,1);
          schema.akun_2 = oneLine[1].substr(0,2);
          schema.akun_3 = oneLine[1].substr(0,3);
          schema.akun_4 = oneLine[1].substr(0,4);
          schema.akun_5 = oneLine[1].substr(0,5);
          schema.akun = oneLine[1];
          schema.deskripsi = oneLine[2];

          try {
            schema.saldo_awal = (isNaN(parseInt(oneLine[3].split('.').join(''))) ? parseInt(oneLine[3].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[3].split('.').join('')));
            schema.aktivitas = (isNaN(parseInt(oneLine[4].split('.').join(''))) ? parseInt(oneLine[4].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[4].split('.').join('')));
            schema.saldo_akhir = (isNaN(parseInt(oneLine[5].split('.').join(''))) ? parseInt(oneLine[5].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[5].split('.').join('')));  
          } catch (error) {
            console.log(error, KPPN);
            console.log(oneLine, LEDGER);
          }

          // try {
          //   schema.saldo_akhir = (isNaN(parseInt(oneLine[5].split('.').join(''))) ? parseInt(oneLine[5].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[5].split('.').join('')));  
          // } catch (error) {
          //   // console.log(error, KPPN);
          //   // console.log(oneLine, LEDGER, 'SALDO AKHIR', oneLine[3]);

          //   let newOneLine = oneLine[3].split(/\s{1,}/);
          //   newOneLine[2] = oneLine[4];

          //   schema.saldo_awal = (isNaN(parseInt(newOneLine[0].split('.').join(''))) ? parseInt(newOneLine[0].split('.').join('').slice(1, -1)) * -1 : parseInt(newOneLine[0].split('.').join('')));
          //   schema.aktivitas = (isNaN(parseInt(newOneLine[1].split('.').join(''))) ? parseInt(newOneLine[1].split('.').join('').slice(1, -1)) * -1 : parseInt(newOneLine[1].split('.').join('')));
          //   schema.saldo_akhir = (isNaN(parseInt(newOneLine[2].split('.').join(''))) ? parseInt(newOneLine[2].split('.').join('').slice(1, -1)) * -1 : parseInt(newOneLine[2].split('.').join('')));  
          // }
          
          this.__akunIsAnalyzee(schema);

          writeStream.write(
            "'" + schema.kppn + '\t' + 
            schema.ledger + '\t' + "'" + 
            schema.satker_1 + '\t' + "'" + 
            schema.satker + '\t' + "'" + 
            schema.akun_1 + '\t' + "'" + 
            schema.akun_2 + '\t' + "'" + 
            schema.akun_3 + '\t' + "'" + 
            schema.akun_4 + '\t' + "'" + 
            schema.akun_5 + '\t' + "'" + 
            schema.akun + '\t' + 
            schema.deskripsi + '\t' + 
            schema.saldo_awal + '\t' + 
            schema.aktivitas + '\t' + 
            schema.saldo_akhir + '\n'
          );
        }
      }
    });
  
    readInterface.on('close', () => {
      console.log('onclose');
      writeStream.close();
    });
  
    console.log('individual file');
  };

  async __akunIsAnalyzee(input) {
    if(this.singleFilter[input['ledger']]) {
      this.singleFilter[input['ledger']].forEach(filter => {

        // Cek akun terlarang
        const regex = RegExp(filter.akun);
        if(regex.test(input.akun)) {
          if(filter.filter === 'perbandingan'){
            this.__updateJawaban(input, filter, null, true);
          }

          this.__truthyAnalyzer(input, filter).then(res => {
            if(!res) {
              this.__updateJawaban(input, filter, res);
            }
          });
        }
      });
    }

    if(this.akrualkas[input.akun]) {
      if(input.ledger === 'Accrual_SATKER') {
        // console.log(input.kppn, this.akrualkas[input.akun], input.akun, input.saldo_akhir);
        try {
          await JawabanAkrualkasModel.updateOne(
            {
              kdkppn: input.kppn,
              bulan: input.bulan,
              ledger: 'akrual',
              akun: input.akun
            },
            {
              $inc: { nilai: input.saldo_akhir }
            }
          );
        } catch (error) {
          console.log(error);
        }
      }

      if(input.ledger === 'Cash_SATKER') {
        // console.log(input.kppn, this.akrualkas[input.akun], input.akun, input.saldo_akhir);
        try {
          await JawabanAkrualkasModel.updateOne(
            {
              kdkppn: input.kppn,
              bulan: input.bulan,
              ledger: 'kas',
              akun: input.akun
            },
            {
              $inc: { nilai: input.saldo_akhir }
            }
          );            
        } catch (error) {
          console.log(error);
        }
      }      
    }
  };

  async __truthyAnalyzer(input, filter) {
    if(filter.bank) {

      const segmentBanks = filter['bank'].split(',');
      // Apakah segmen bank input termasuk dalam segmen bank yang difilter?
      if(segmentBanks.includes(input['satker'].substr(0,1))){
        // Jika saldo akhir harus positif
        if(filter.must === 'positive'){
          return input[filter['at']] >= 0;
        }

        if(filter.must_not === 'exist') {
          return false;
        }

        const mustAkun = filter['must'].split(',');
        return mustAkun.includes(input['akun']);
      }

      return true;
    }

    if(filter.must_not && filter.must_not === 'suspense') {
      const regex = /^ZZZ[0-9]{3}/;

      return !regex.test(input[filter['at']]);
    }

    if(filter.must && filter.must === 'zero') {
      return input[filter['at']] === 0;
    }

    if(filter.must && filter.must === 'positive') {
      return input[filter['at']] >= 0;
    }

    if(filter.must && filter.must === 'negative') {
      return input[filter['at']] <= 0;
    }

    if(filter.must && filter.must === 'kbun') {
      const regex = /999[0-9]{3}/;

      return regex.test(input[filter['at']]);
    }

    if(filter.must_not && filter.must_not === 'kbun') {
      const regex = /999[0-9]{3}/;

      return !regex.test(input[filter['at']]);
    }

    if(filter.filter && filter.filter === 'satker') {
      if(filter.must === 'djpdjbc'){
        let djp = '';
        let djbc = '';
        let djpdjbc = [];
        
        try {
          djp = this.profilKppn.djp.split(',');
          djbc = this.profilKppn.djbc.split(',');
        } catch (error) {
          console.log('Empty DJP/DJBC filter');
        }

        djpdjbc = [...djp, ...djbc];

        return djpdjbc.includes(input.satker);
      }

      if(filter.must === 'djpprdjpk'){
        return input['satker'] === this.profilKppn.djppr || input['satker'] === this.profilKppn.djpk;
      }
      
      if(filter.must === 'djppr'){
        return input['satker'] === this.profilKppn.djppr;
      }
    }
  }

  async __updateJawaban(input, filter, answer, perbandingan=false) {
    try {
      if(perbandingan) {
        if(filter.position === 'left') {
          await JawabanModel.updateOne({
            kdkppn: input.kppn,
            bulan: input.bulan,
            pertanyaan_id: filter.pertanyaan_id
          },
            { $inc: { left: input.saldo_akhir } }
          );
        }

        if(filter.position === 'right') {
          await JawabanModel.updateOne({
            kdkppn: input.kppn,
            bulan: input.bulan,
            pertanyaan_id: filter.pertanyaan_id
          },
            { $inc: { right: input.saldo_akhir } }
          );
        }
      } else {
        await JawabanModel.updateOne({
          kdkppn: input.kppn,
          bulan: input.bulan,
          pertanyaan_id: filter.pertanyaan_id
        },
          { $set: { jawaban: answer } }
        );  
      }
    } catch (error) {
      console.log(error);
    }
  }

  __jawabanPerbandingan(perbandingan) {
    perbandingan.forEach(async item => {
      let jawaban;

      if(item.sign === 'greater'){
        jawaban = item.left >= item.right;
      }

      if(item.sign === 'equal'){
        jawaban = item.left === item.right;
      }

      try {
        await JawabanModel.updateOne({
          kdkppn: item.kdkppn,
          bulan: item.bulan,
          pertanyaan_id: item.pertanyaan_id
        }, 
          { $set: { jawaban: jawaban }
        });
      } catch (error) {
        console.log(error, item.kdkppn);
      }
    });
  }
}

module.exports = new Analyzer;