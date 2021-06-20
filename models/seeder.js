const PertanyaanModel = require('../models/pertanyaan');
const JawabanModel = require('../models/jawaban');
const AkrualKasModel = require('../models/akrualkas');
const JawabanAkrualkasModel = require('../models/jawaban-akrualkas');
const MutasiModel = require('../models/mutasi');
const JawabanMutasiModel = require('../models/jawaban-mutasi');
const akrualkas = require('../models/akrualkas');

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
      jawaban: true,
      kesalahan: []
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

  const data = makeSeedAkrualkas(kdkppn, bulan, akrualKas);

  try {
    await JawabanAkrualkasModel.deleteMany({
      kdkppn,
      bulan
    });
    await JawabanAkrualkasModel.insertMany(data);
  } catch (error) {
    console.log(error);
  }
}


const mutasiAkrualKas = async (kdkppn, bulan) => {
  let mutasi = [];

  try {
    mutasi = await MutasiModel.find();
  } catch (error) {
    console.log(error);
  }

  const data = makeSeedAkrualkas(kdkppn, bulan, mutasi);

  try {
    await JawabanMutasiModel.deleteMany({
      kdkppn,
      bulan
    });
    await JawabanMutasiModel.insertMany(data);
  } catch (error) {
    console.log(error);
  }
}


exports.jawabanSeeder = jawabanSeeder;
exports.accrualVsCashSeeder = accrualVsCashSeeder;
exports.mutasiAkrualKas = mutasiAkrualKas;


const makeSeedAkrualkas = (kdkppn, bulan, data) => {
  let container = [];

  data.forEach(element => {

    element.akuns.forEach(akun => {
      let perakun = {};

      perakun['kdkppn'] = kdkppn;
      perakun['bulan'] = bulan;
      perakun['kategori'] = element.kategori;
      perakun['desc'] = element.desc;
      perakun['ledger'] = element.ledger;
      perakun['akun'] = akun;
      perakun['nilai'] = 0;

      container.push(perakun);
    });

  });

  return container;
}