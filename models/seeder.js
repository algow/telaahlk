const PertanyaanModel = require('../models/pertanyaan');
const JawabanModel = require('../models/jawaban');
const AkrualKasModel = require('../models/akrualkas');
const JawabanAkrualkasModel = require('../models/jawaban-akrualkas');

const jawabanSeeder = async (kdkppn, bulan) => {
  let jawabans = [];
  let pertanyaans = [];

  try {
    pertanyaans = await PertanyaanModel.find({});
  } catch (error) {
    console.log(error);
  }

  pertanyaans.forEach(pertanyaan => {
    let jawaban = {
      kdkppn: kdkppn,
      bulan: bulan,
      pertanyaan_id: null,
      jawaban: true
    };

    jawaban.pertanyaan_id = pertanyaan._id;
    jawabans.push(jawaban);
  });

  try {
    await JawabanModel.deleteMany({
      kdkppn,
      bulan
    });
    await JawabanModel.insertMany(jawabans);
  } catch (error) {
    console.log(error);
  }
}

const accrualVsCashSeeder = async (kdkppn, bulan) => {
  let akrualKas = [];

  try {
    akrualKas = await AkrualKasModel.find();
  } catch (error) {
    console.log(error);
  }

  let data = [];
  let akuns = {};

  akrualKas.forEach(element => {
    // let placeholder = {
    //   kdkppn: kdkppn,
    //   bulan: bulan,
    //   kategori: element.kategori,
    //   ledger: element.ledger,
    //   akun: 'TOTAL ' + element.kategori,
    //   nilai: 0
    // };

    // data.push(placeholder);

    element.akuns.forEach(akun => {
      // let perakun = JSON.parse(JSON.stringify(placeholder));
      let perakun = {};

      perakun['kdkppn'] = kdkppn;
      perakun['bulan'] = bulan;
      perakun['kategori'] = element.kategori;
      perakun['ledger'] = element.ledger;
      perakun['akun'] = akun;
      perakun['nilai'] = 0;

      data.push(perakun);

      // jika akun akrual ada, push kas pada ledger
      if(akuns[akun]) {
        akuns[akun].push(element.ledger);
      } else {
        akuns[akun] = [element.ledger];
      }
    });
  });

  try {
    await JawabanAkrualkasModel.deleteMany({
      kdkppn,
      bulan
    });
    await JawabanAkrualkasModel.insertMany(data);
  } catch (error) {
    console.log(error);
  }

  return akuns;
}

exports.jawabanSeeder = jawabanSeeder;
exports.accrualVsCashSeeder = accrualVsCashSeeder;

// const accrualVsCashSeeder = () => {
//   const data = [
//     {
//       kategori: 'Kas_Kppn',
//       ledger: 'kas',
//       akuns: [111121, 111214, 111412, 111421, 111422, 111423, 111431, 111432, 111433, 111441, 111461, 111462, 111463, 111469]
//     },
//     {
//       kategori: 'Kas_Kppn',
//       ledger: 'akrual',
//       akuns: [111121, 111214, 111412, 111421, 111422, 111423, 111431, 111432, 111433, 111441, 111461, 111462, 111463, 111469]
//     },
//     {
//       kategori: 'Kas_Hibah',
//       ledger: 'kas',
//       akuns: [111822]
//     },
//     {
//       kategori: 'Kas_Hibah',
//       ledger: 'akrual',
//       akuns: [111822]
//     },
//     {
//       kategori: 'Kas_Blu',
//       ledger: 'kas',
//       akuns: [111911]
//     },
//     {
//       kategori: 'Kas_Blu',
//       ledger: 'akrual',
//       akuns: [111911]
//     },
//     {
//       kategori: 'Kas_Transito',
//       ledger: 'kas',
//       akuns: [111511, 111512, 111517, 818111, 828111]
//     },
//     {
//       kategori: 'Kas_Transito',
//       ledger: 'akrual',
//       akuns: [111511, 111512]
//     },
//     {
//       kategori: 'Retur',
//       ledger: 'kas',
//       akuns: [212191, 219941, 816211, 817111, 817113, 827111, 827113]
//     },
//     {
//       kategori: 'Retur',
//       ledger: 'akrual',
//       akuns: [212145, 212191, 219941]
//     },
//     {
//       kategori: 'Koreksi_Pemindahbukuan',
//       ledger: 'kas',
//       akuns: [219913, 816111, 826111]
//     },
//     {
//       kategori: 'Koreksi_Pemindahbukuan',
//       ledger: 'akrual',
//       akuns: [219913]
//     },
//     {
//       kategori: 'Kesalahan_Bank',
//       ledger: 'kas',
//       akuns: [219944, 817911, 827911]
//     },
//     {
//       kategori: 'Kesalahan_Bank',
//       ledger: 'akrual',
//       akuns: [219944]
//     }
//   ];

//   AkrualKasModel.insertMany(data);
// }