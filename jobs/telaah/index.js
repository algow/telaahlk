const { getFilterAkrualKas, getFilterMutasi } = require('../../redis/storage');
const { akrualkas, mutasiAkralkas } = require('./akrual-kas');
const segmenSatker = require('./segmen-satker');
const segmenBank = require('./segmen-bank');

const telaah = async (input, filters) => {

  if(input.ledger === 'Cash_SATKER' || input.ledger === 'Accrual_SATKER') {
    await segmenSatker(input, filters);
  }

  if(input.ledger === 'Cash_BANK') {
    await segmenBank(input, filters);
  }

  const akrualKasFilter = await getFilterAkrualKas();

  // Cek apakah akun ada pada filter akrualkas
  if(akrualKasFilter[input.akun]) {
    await akrualkas(input, akrualKasFilter[input.akun]);
  }

  const mutasiFilter = await getFilterMutasi();

  if(mutasiFilter[input.akun]) {
    await mutasiAkralkas(input, mutasiFilter[input.akun]);
  }
  
}

module.exports = telaah;