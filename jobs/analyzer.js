const readline = require('readline');
const fs = require('fs');
const storage = require('../redis/storage');
const { jawabanSeeder, accrualVsCashSeeder } = require('../models/seeder');
const SingleFilterModel = require('../models/single-filter');
const JawabanModel = require('../models/jawaban');
const UserModel = require('../models/user');
const JawabanAkrualkasModel = require('../models/jawaban-akrualkas');

class Analyzer{
  constructor(){
    this.singleFilter = [];
    this.akrualkas = [];
  }

  async __singeFilter() {
    let singleFilter = [];
    let singleFilterGrouped = {
      Accrual_SATKER: [],
      Cash_SATKER: []
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

  async analyze() {
    let kdkppn = '';
    let bulan = 0;
    let analyzeeFiles = [];
  
    try {
      this.singleFilter = await this.__singeFilter();
      // await storage.setProccess('yes');
      const queueData = await storage.popQueue();
  
      kdkppn = queueData.kdkppn;
      bulan = queueData.bulan;
      analyzeeFiles = queueData.files;
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
  
    analyzeeFiles.forEach(file => {
      this.__parser(kdkppn, bulan, file, timestamp);
    });
  };

  __parser(kdkppn, bulan, filename, timestamp) {
    const KPPN = kdkppn;
    let LEDGER = '';
  
    let schema = {
      kppn: '',
      bulan: 0,
      ledger: '',
      satker: '',
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
  
    const writeStream = fs.createWriteStream('./publics/xls/'+ kdkppn + '_' + timestamp + '.xls', {flags: 'a'});
  
    readInterface.on('line', line => {
      const oneLine = line.split(/\s{2,}/);
  
      if(Array.isArray(oneLine) && oneLine.length > 1) {
        schema.kppn = KPPN;
        schema.bulan = bulan;
  
        if(LEDGER.split('_').length < 2) {
          if(oneLine[1] === 'Buku Besar:') {
            LEDGER += oneLine[2].split(' ')[1];
          }
      
          if(oneLine[2] === 'Deskripsi AKUN') {
            LEDGER += '_' + oneLine[0];
          }
      
          schema.ledger = LEDGER;
        }
  
        if(/^[0-9]{6}/.test(oneLine[1])){
  
          if(oneLine[0] === ''){
            schema.satker = schema.satker;
          } else {
            schema.satker = oneLine[0];
          }
  
          schema.akun = oneLine[1];
          schema.deskripsi = oneLine[2];
          schema.saldo_awal = (isNaN(parseInt(oneLine[3].split('.').join(''))) ? parseInt(oneLine[3].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[3].split('.').join('')));
          schema.aktivitas = (isNaN(parseInt(oneLine[4].split('.').join(''))) ? parseInt(oneLine[4].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[4].split('.').join('')));
          schema.saldo_akhir = (isNaN(parseInt(oneLine[5].split('.').join(''))) ? parseInt(oneLine[5].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[5].split('.').join('')));
          
          this.__akunIsAnalyzee(schema);
          writeStream.write("'" + schema.kppn + '\t' + schema.ledger + '\t' + "'" + schema.satker + '\t' + "'" + schema.akun + '\t' + schema.deskripsi + '\t' + schema.saldo_awal + '\t' + schema.aktivitas + '\t' + schema.saldo_akhir + '\n');
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
    if(this.akrualkas[input.akun]) {
      if(input.ledger === 'Accrual_SATKER') {
        // console.log(input.kppn, this.akrualkas[input.akun], input.akun, input.saldo_akhir);

        try {
          await JawabanAkrualkasModel.updateOne(
            {
              kdkppn: input.kppn,
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

    if(this.singleFilter[input['ledger']]) {
      this.singleFilter[input['ledger']].forEach(filter => {
        // Cek akun tanpa filter
        

        // Cek akun terlarang
        const regex = RegExp(filter.akun);

        if(regex.test(input.akun)) {
          this.__truthyAnalyzer(input, filter).then(res => {
            if(!res) {
              this.__updateJawaban(input, filter, res);
            }
          });
        }
      });
    }
  };

  async __truthyAnalyzer(input, filter){
    if(filter.must === 'zero') {
      return input[filter['at']] === 0;
    }

    if(filter.must === 'positive') {
      return input[filter['at']] >= 0;
    }

    if(filter.must === 'negative') {
      return input[filter['at']] <= 0;
    }

    if(filter.must === 'kbun') {
      const regex = /999[0-9]{3}/;

      return regex.test(input[filter['at']]);
    }

    if(filter.must_not === 'kbun') {
      const regex = /999[0-9]{3}/;

      return !regex.test(input[filter['at']]);
    }

    if(filter.filter === 'satker') {
      let djppr = '';
      let djpk = '';
      let djp = '';
      let djbc = '';

      try {
        const data = await UserModel.find({kdkppn: input.kppn});
        djppr = data.djppr;
        djpk = data.djpk;
        djp = data.djp;
        djbc = data.djbc;
      } catch (error) {
        console.log(error);
      }

      if(filter.must === 'djpprdjpk'){
        return input['satker'] === djppr || input['satker'] === djpk;
      }
      
      if(filter.must === 'djppr'){
        return input['satker'] === djppr;
      }

      if(filter.must === 'djpdjbc'){
        return input['satker'] === djp || input['satker'] === djbc;
      }
    }
  }

  async __updateJawaban(input, filter, answer) {
    try {
      await JawabanModel.updateOne({
        kdkppn: input.kppn,
        bulan: input.bulan,
        pertanyaan_id: filter.pertanyaan_id
      },
        { $set: { jawaban: answer } }
      );
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new Analyzer;