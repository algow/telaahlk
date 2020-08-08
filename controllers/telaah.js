const express = require('express');
const PertanyaanModel = require('../models/pertanyaan');
const JawabanAkrualkasModel = require('../models/jawaban-akrualkas');

const router = express.Router();

router.get('/', async (request, response) => {
  let data = [];
  let akrualkas = [];

  try {
    data = await PertanyaanModel.aggregate([
      { $lookup: {
        from: 'jawabans',
        localField: '_id',
        foreignField: 'pertanyaan_id',
        as: 'jawaban'
      }},
      { $group: {
        _id: '$ledger',
        body: {$push: '$$ROOT'}
      }}
    ]);

    akrualkas = await JawabanAkrualkasModel.aggregate([
      {$group: {
        _id: '$kategori',
        data: {$push: '$$ROOT'}
      }}
    ]);

    // data.push({
    //   _id: 'Akrualkas',
    //   body: akrualkas
    // });
  } catch (error) {
    return response.status(500).send({
      msg: 'something went wrong'
    });
  }

  const message = {
    message: 'success',
    data: data,
    akrualkas: akrualkas
  }

  return response.status(200).send(message);
});

module.exports = router;