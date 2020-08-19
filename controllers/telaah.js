const express = require('express');
const JawabanModel = require('../models/jawaban');
const JawabanAkrualkasModel = require('../models/jawaban-akrualkas');
const DownloadModel = require('../models/download');
// const {accrualVsCashSeeder} = require('../models/seeder');

const router = express.Router();

router.post('/', async (request, response) => {
  // accrualVsCashSeeder();
  const { kdkppn, bulan } = request.body;

  let excelFile = '';
  let segmenSatker = [];
  let akrualkas = [];

  try {
    excelFile = await DownloadModel.find({kdkppn: kdkppn, bulan: bulan});

    segmenSatker = await JawabanModel.aggregate([
      { $match: {kdkppn: kdkppn, bulan: bulan} },
      { $lookup: {
        from: 'pertanyaans',
        localField: 'pertanyaan_id',
        foreignField: '_id',
        as: 'pertanyaan'
      } },
      {
        $unwind: '$pertanyaan'
      },
      {$sort:{ 'pertanyaan.nomor': 1 }},
      { $group: {
        _id: '$pertanyaan.ledger',
        body: {$push: '$$ROOT'}
      }}
      
    ]);

    akrualkas = await JawabanAkrualkasModel.aggregate([
      { $match: {kdkppn: kdkppn} },
      { $group: {
        _id: {kategori: '$kategori', akun: '$akun'},
        body: {$push: '$$ROOT'}
      }},
      { $group: {
        _id: '$_id.kategori',
        body: {$push: {
          akun: '$_id.akun',
          body: '$body'
        }}
      }}
    ]);
  } catch (error) {
    return response.status(500).send({
      msg: 'something went wrong'
    });
  }

  const message = {
    message: 'success',
    segmen_satker: segmenSatker,
    akrualkas: akrualkas
  }

  try {
    message.file = excelFile[0].file;
  } catch (error) {
    return response.status(404).send({
      msg: 'tidak ditemukan'
    });
  }

  return response.status(200).send(message);
});

module.exports = router;