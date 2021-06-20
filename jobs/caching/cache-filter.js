const SingleFilterModel = require('../../models/single-filter');
const AkrualKasModel = require('../../models/akrualkas');
const MutasiModel = require('../../models/mutasi');
const TrieNode = require('./TrieNode');
const TrieHelper = require('./trie-helpers');
const redisStorage = require('../../redis/storage');

exports.singleFilterCache = async () => {
  let singleFilterData = [];

  try {
    singleFilterData = await SingleFilterModel.find();
  } catch (error) {
    console.log(error);
  }

  let nodes = {
    Accrual_SATKER: new TrieNode('0'),
    Cash_SATKER: new TrieNode('0'),
    Cash_BANK: new TrieNode('0')
  };

  singleFilterData.forEach(filter => {
    const node = nodes[filter.ledger];

    const Trie = new TrieHelper(node);
    Trie.insert(filter);
  });

  redisStorage.setFilterData(nodes);
}


exports.akrualkasCache = async () => {
  let akrualkas = [];

  try {
    akrualkas = await AkrualKasModel.find();
  } catch (error) {
    console.log(error);
  }

  let akunFilters = {};

  akrualkas.forEach(element => {
    element.akuns.forEach(akun => {

      // jika akun akrual ada, push kas pada ledger
      if(akunFilters[akun]) {
        akunFilters[akun].push(element.ledger);
      } else {
        akunFilters[akun] = [element.ledger];
      }

    });
  });

  redisStorage.setFilterAkrualKas(akunFilters);
}


exports.mutasiCache = async () => {
  let mutasi = [];

  try {
    mutasi = await MutasiModel.find();
  } catch (error) {
    console.log(error);
  }

  let akunFilters = {};

  mutasi.forEach(element => {
    element.akuns.forEach(akun => {

      // jika akun akrual ada, push kas pada ledger
      if(akunFilters[akun]) {
        akunFilters[akun].push(element.ledger);
      } else {
        akunFilters[akun] = [element.ledger];
      }
    });
  });

  redisStorage.setFilterMutasi(akunFilters);
}