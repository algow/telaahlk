const express = require('express');
const User = require('../models/user');
const { response } = require('express');

const router = express.Router();

router.get('/', async (request, response) => {
  let user = {};

  try {
    user = await User.find({kdkppn: request.body.kdkppn});
  } catch (error) {
    return response.status(500).send({
      msg: 'something went wrong'
    }); 
  }

  return response.status(200).send({
    msg: 'success',
    data: user
  });
});

router.post('/', async (request, response) => {
  try {
    const user = new User(request.body);
    await user.save();
  } catch (error) {
    return response.status(500).send({
      msg: 'something went wrong'
    });
  }

  return response.status(200).send({
    msg: 'success'
  });
});

router.put('/', async (request, response) => {
  const { kdkppn, nama, djp, djbc, djppr, djpk } = request.body;

  try {
    await User.updateOne({
      kdkppn: kdkppn
    },
    {
      $set: {
        kdkppn, nama, djp, djbc, djppr, djpk
      }
    }
  );
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