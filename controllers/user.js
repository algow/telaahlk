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
    data: user[0]
  });
});

router.post('/', async (request, response) => {
  let user = {};

  try {
    userData = await User.find({kdkppn: request.body.kdkppn});

    if(userData.length === 0){
      user = new User(request.body);
      await user.save();
    } else {
      user = userData[0];
    }
  } catch (error) {
    return response.status(500).send({
      msg: 'something went wrong'
    });
  }

  return response.status(200).send({
    msg: 'success',
    user: user
  });
});

router.put('/', async (request, response) => {
  let { kdkppn, nama, djp, djbc, djppr, djpk } = request.body;

  djp = djp.replace(/\s/g,'');
  djbc = djbc.replace(/\s/g,'');
  djppr = djppr.replace(/\s/g,'');
  djpk = djpk.replace(/\s/g,'');

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