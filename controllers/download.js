const express = require('express');

const router = express.Router();

router.get('/', (request, response) => {
  return response.download(__dirname + '/../publics/xls/' + request.query.file); 
});

router.get('/format_satker', (request, response) => {
  const filename = 'datasatker.csv';
  return response.download(__dirname + '/../publics/xls/' + filename); 
});

module.exports = router;