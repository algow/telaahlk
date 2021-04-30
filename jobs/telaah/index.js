const { getFilterAkrualKas } = require('../../redis/storage');
const akrualkas = require('./akrual-kas');
const segmenSatker = require('./segmen-satker');
const segmenBank = require('./segmen-bank');

const telaah = async (input, filters) => {

  
  const akrualKasFilter = await getFilterAkrualKas();

  // Cek apakah akun ada pada filter akrualkas
  if(akrualKasFilter[input.akun]) {
    await akrualkas(input, akrualKasFilter[input.akun]);
  }

  if(input.ledger === 'Cash_SATKER' || input.ledger === 'Accrual_SATKER') {
    segmenSatker(input, filters);
  }

  if(input.ledger === 'Cash_BANK') {
    segmenBank(input, filters);
  }
  
}

module.exports = telaah;