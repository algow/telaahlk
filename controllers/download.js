const express = require('express');

const router = express.Router();

router.get('/', (request, response) => {
  return response.download(__dirname + '/../publics/xls/' + request.query.file); 
});

module.exports = router;