const updateJawaban = require('./db-update');
const mailQueue = require('../caching/mail-queue');

const segmenBank = async (input, filters) => {
  for(const filter of filters) {
    const isInputWajar = conditions(input, filter);

    if(!isInputWajar) {
      await updateJawaban(input, filter, false);

      // Log jawaban anomali di sini
      // await mailQueue(input);
    }
  }
}

module.exports = segmenBank;


const conditions = (input, filter) => {
  const segmentBanks = filter['bank'].split(',');
  // Apakah segmen bank input termasuk dalam segmen bank yang difilter?
  if(segmentBanks.includes(input['satker'].substr(0,1))){
    // Jika saldo akhir harus positif
    if(filter.must === 'positive'){
      return input[filter['at']] >= 0;
    }

    if(filter.must_not === 'exist') {
      return false;
    }

    const mustAkun = filter['must'].split(',');
    return mustAkun.includes(input['akun']);
  }

  return true;
}