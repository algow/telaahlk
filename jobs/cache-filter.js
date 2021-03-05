const SingleFilterModel = require('../models/single-filter');
const redisStorage = require('../redis/storage');
const fs = require('fs');

const cacheFilter = async () => {
  let singleFilterData = [];

  try {
    singleFilterData = await SingleFilterModel.find();
  } catch (error) {
    console.log(error);
  }

  let groupedFilter = {
    Accrual_SATKER: {},
    Cash_SATKER: {},
    Cash_BANK: {}
  };

  singleFilterData.forEach(filter => {
    const { ledger, akun } = filter;

    if(groupedFilter[ledger][akun] === undefined) {
      groupedFilter[ledger][akun] = [];
    }

    groupedFilter[ledger][akun].push(filter);
  });

  redisStorage.setFilterData(groupedFilter);
}

module.exports = cacheFilter;