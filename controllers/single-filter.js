const express = require('express');
const Pertanyaan = require('../models/pertanyaan');
const SingleFilterModel = require('../models/single-filter');

const router = express.Router();

router.post('/', async (request, response) => {
  const { ledger, nomor, pertanyaan, akuns, filter, sign } = request.body;

  const pertanyaanData = { ledger, nomor, pertanyaan, sign };
  let singleFilterData = [];
  let pertanyaanId = '';
  
  try {
    const pertanyaan = new Pertanyaan(pertanyaanData);
    const data = await pertanyaan.save();
    pertanyaanId = data._id;
  } catch (error) {
    console.log(error);
  }

  if(filter === 'perbandingan') {
    const left = akunSpliter(request.body.left, pertanyaanId, request.body, 'left');
    const right = akunSpliter(request.body.right, pertanyaanId, request.body, 'right');

    singleFilterData = [...left, ...right];
  } else {
    singleFilterData = akunSpliter(akuns, pertanyaanId, request.body);
  }

  try {
    await SingleFilterModel.insertMany(singleFilterData);
  } catch (error) {
    return response.status(500).send({
      msg: 'something went wrong'
    });
  }

  return response.status(200).send({
    msg: 'success'
  });
});

module.exports = router;


const akunSpliter = (akuns, pertanyaanId, input, position=undefined) => {
  let singleFilterData = [];

  akuns.split(',').map(akun => {
    let countX = 0;

    for (const char of akun) {
      if(isNaN(parseInt(char))) {
        countX++;
      }
    }

    let regex = `^${akun.slice(0, 6-countX)}[0-9]{${countX}}`;

    singleFilterData.push({ 
      pertanyaan_id: pertanyaanId, 
      akun: regex, 
      nomor: input.nomor, 
      filter: input.filter, 
      must: input.must, 
      must_not: input.must_not, 
      at: input.at, 
      ledger: input.ledger,
      position
    });
  });

  return singleFilterData;
}