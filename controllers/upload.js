const express = require('express');
const multer  = require('multer');
const storage = require('../redis/storage');
const event = require('../redis/event');

const router = express.Router();
const upload = multer({ dest: './publics/text/' });

router.post('/', upload.any(), async (request, response) => {
  let queueData = [];

  request.files.forEach((file, index) => {
    let queue = {
      index: index,
      kdkppn: request.body.kode,
      bulan: request.body.bulan,
      filename: file.filename,
      ledger: ''
    };

    queueData.push(queue);
  });

  try {
    await storage.setQueue(queueData);
    await event.pub();
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