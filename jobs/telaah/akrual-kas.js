const JawabanAkrualkasModel = require('../../models/jawaban-akrualkas');

const akrualkas = async (input, filter) => {
  if(filter.includes(input.ledger)) {
    
    try {
      await JawabanAkrualkasModel.updateOne({
        kdkppn: input.kppn,
        bulan: input.bulan,
        ledger: input.ledger,
        akun: input.akun
      }, {
        $inc: { nilai: input.saldo_akhir }
      });
    } catch (error) {
      console.log(error);
    }

  }
}

module.exports = akrualkas;