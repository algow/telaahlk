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

    if(pertanyaan.sign){
      jawaban.filter = 'perbandingan';
      jawaban.sign = pertanyaan.sign;
      jawaban.left = 0;
      jawaban.right = 0;
    }

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
      perakun['desc'] = element.desc;
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

// const accrualVsCashSeeder = async () => {
//   const data = [
//     {
//       kategori: 'Kas_Kppn',
//       desc: 'Kas di KPPN',
//       ledger: 'kas',
//       akuns: [111121, 111214, 111412, 111421, 111422, 111423, 111431, 111432, 111433, 111441, 111461, 111462, 111463, 111469]
//     },
//     {
//       kategori: 'Kas_Kppn',
//       desc: 'Kas di KPPN',
//       ledger: 'akrual',
//       akuns: [111121, 111214, 111412, 111421, 111422, 111423, 111431, 111432, 111433, 111441, 111461, 111462, 111463, 111469]
//     },
//     {
//       kategori: 'Kas_Hibah',
//       desc: 'Kas Lainnya di K/L Dari Hibah',
//       ledger: 'kas',
//       akuns: [111822]
//     },
//     {
//       kategori: 'Kas_Hibah',
//       desc: 'Kas Lainnya di K/L Dari Hibah',
//       ledger: 'akrual',
//       akuns: [111822]
//     },
//     {
//       kategori: 'Kas_Blu',
//       desc: 'Kas di BLU',
//       ledger: 'kas',
//       akuns: [111911]
//     },
//     {
//       kategori: 'Kas_Blu',
//       desc: 'Kas di BLU',
//       ledger: 'akrual',
//       akuns: [111911]
//     },
//     {
//       kategori: 'Kas_Transito',
//       desc: 'Kas Dalam Transito',
//       ledger: 'kas',
//       akuns: [111511, 111512, 111517, 818111, 828111]
//     },
//     {
//       kategori: 'Kas_Transito',
//       desc: 'Kas Dalam Transito',
//       ledger: 'akrual',
//       akuns: [111511, 111512]
//     },
//     {
//       kategori: 'Retur',
//       desc: 'Utang Kepada Pihak Ketiga (Retur)',
//       ledger: 'kas',
//       akuns: [212191, 219941, 816211, 817111, 817113, 827111, 827113]
//     },
//     {
//       kategori: 'Retur',
//       desc: 'Utang Kepada Pihak Ketiga (Retur)',
//       ledger: 'akrual',
//       akuns: [212145, 212191, 219941]
//     },
//     {
//       kategori: 'Koreksi_Pemindahbukuan',
//       desc: 'Utang Kepada Pihak Ketiga (Koreksi Pemindahbukuan)',
//       ledger: 'kas',
//       akuns: [219913, 816111, 826111]
//     },
//     {
//       kategori: 'Koreksi_Pemindahbukuan',
//       desc: 'Utang Kepada Pihak Ketiga (Koreksi Pemindahbukuan)',
//       ledger: 'akrual',
//       akuns: [219913]
//     },
//     {
//       kategori: 'Kesalahan_Bank',
//       desc: 'Utang Kepada Pihak Ketiga (Kesalahan Sistem Perbankan)',
//       ledger: 'kas',
//       akuns: [219944, 817911, 827911]
//     },
//     {
//       kategori: 'Kesalahan_Bank',
//       desc: 'Utang Kepada Pihak Ketiga (Kesalahan Sistem Perbankan)',
//       ledger: 'akrual',
//       akuns: [219944]
//     }
//   ];

//   let foo = '';

//   try {
//     foo = await AkrualKasModel.insertMany(data);
//   } catch (error) {
//     console.log(error);
//   }

//   console.log(foo);
//   // AkrualKasModel.insertMany(data).then(res => {
//   //   console.log(res);
//   // }).catch(err => {
//   //   console.log(err)
//   // });
// }

// exports.accrualVsCashSeeder = accrualVsCashSeeder;