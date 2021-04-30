const updateJawaban = require('./db-update');
const UserModel = require('../../models/user');

const segmenSatker = (input, filters) => {
  filters.forEach(async filter => {
    const isInputWajar = await conditions(input, filter);
    
    if(!isInputWajar) {
      await updateJawaban(input, filter, false);
    }
  });
}

module.exports = segmenSatker;


const conditions = async (input, filter) => {
  if(filter.must_not && filter.must_not === 'suspense') {
    const regex = /^ZZZ[0-9]{3}/;

    return !regex.test(input[filter['at']]);
  }

  if(filter.must && filter.must === 'zero') {
    return input[filter['at']] === 0;
  }

  if(filter.must && filter.must === 'positive') {
    return input[filter['at']] >= 0;
  }

  if(filter.must && filter.must === 'negative') {
    return input[filter['at']] <= 0;
  }

  if(filter.must && filter.must === 'kbun') {
    const regex = /999[0-9]{3}/;

    return regex.test(input[filter['at']]);
  }

  if(filter.must_not && filter.must_not === 'kbun') {
    const regex = /999[0-9]{3}/;

    return !regex.test(input[filter['at']]);
  }

  if(filter.filter && filter.filter === 'satker') {
    const user = await UserModel.find({kdkppn: input.kppn});
    const profilKppn = user[0];

    if(filter.must === 'djpdjbc'){
      let djp = '';
      let djbc = '';
      let djpdjbc = [];
      
      try {
        djp = profilKppn.djp.split(',');
        djbc = profilKppn.djbc.split(',');
      } catch (error) {
        console.log('Empty DJP/DJBC filter');
      }

      djpdjbc = [...djp, ...djbc];

      return djpdjbc.includes(input.satker);
    }

    if(filter.must === 'djpprdjpk'){
      return input['satker'] === profilKppn.djppr || input['satker'] === profilKppn.djpk;
    }
    
    if(filter.must === 'djppr'){
      return input['satker'] === profilKppn.djppr;
    }
  }
}