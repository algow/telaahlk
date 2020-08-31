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
    this.profilKppn = {}
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

    analyzeeFiles.forEach(file => {
      this.__parser(kdkppn, bulan, file, excelName);
    });

    try {
      await DownloadModel.deleteMany({kdkppn, bulan});
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

  __parser(kdkppn, bulan, filename, excelName) {
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
    
    const writeStream = fs.createWriteStream('./publics/xls/'+ excelName, {flags: 'a'});
    
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

          try {
            schema.saldo_awal = (isNaN(parseInt(oneLine[3].split('.').join(''))) ? parseInt(oneLine[3].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[3].split('.').join('')));
            schema.aktivitas = (isNaN(parseInt(oneLine[4].split('.').join(''))) ? parseInt(oneLine[4].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[4].split('.').join('')));
            schema.saldo_akhir = (isNaN(parseInt(oneLine[5].split('.').join(''))) ? parseInt(oneLine[5].split('.').join('').slice(1, -1)) * -1 : parseInt(oneLine[5].split('.').join('')));  
          } catch (error) {
            console.log(error, KPPN);
          }
          
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

    if(this.singleFilter[input['ledger']]) {
      // console.log(this.singleFilter[input['ledger']]);
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

  async __truthyAnalyzer(input, filter) {
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
        const djp = this.profilKppn.djp.split(',');
        const djbc = this.profilKppn.djbc.split(',');
        const djpdjbc = [...djp, ...djbc];

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