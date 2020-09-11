const express = require('express');
const PertanyaanModel = require('../models/pertanyaan');
const DoubleFilterModel = require('../models/double-filter');

const router = express.Router();

router.post('/', async (request, response) => {
  const { ledger, pertanyaan, nomor, left, right } = request.body;

  const pertanyaanData = { ledger, nomor, pertanyaan };
  let pertanyaanId = '';

  try {
    const pertanyaan = new PertanyaanModel(pertanyaanData);
    const data = await pertanyaan.save();
    pertanyaanId = data._id;
  } catch (error) {
    console.log(error);
  }

  
})

module.exports = router;