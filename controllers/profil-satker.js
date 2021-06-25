const express = require('express');
const multer  = require('multer');
const profilSatkerJob = require('../jobs/profil-satker');
const SatkerUploadModel = require('../models/satkers-upload');

const router = express.Router();
const upload = multer({ dest: './publics/text/satker/' });

router.get('/', async (request, response) => {
  let profilSatker = '';

  try {
    profilSatker = await SatkerUploadModel.find({kdkppn: request.query.kdkppn});
  } catch (error) {
    return response.status(500).send({
      msg: 'something went wrong'
    });
  }

  if(!profilSatker[0]) {
    return response.status(404).send({
      msg: 'not found'
    });
  }

  return response.status(200).send({
    msg: 'success',
    data: profilSatker[0]
  });
});

router.get('/download', (request, response) => {
  return response.download(__dirname + '/../publics/text/satker/' + request.query.file); 
});

router.post('/', upload.any(), (request, response) => {
  profilSatkerJob(request);

  return response.status(200).send({
    msg: 'success'
  });
});

module.exports = router;