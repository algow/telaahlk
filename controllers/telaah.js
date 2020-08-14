const express = require('express');
const JawabanModel = require('../models/jawaban');
const JawabanAkrualkasModel = require('../models/jawaban-akrualkas');

const router = express.Router();

router.post('/', async (request, response) => {
  const { kdkppn, bulan } = request.body;

  let segmenSatker = [];
  let akrualkas = [];

  try {
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

  return response.status(200).send(message);
});

module.exports = router;