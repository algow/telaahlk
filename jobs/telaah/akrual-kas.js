const JawabanAkrualkasModel = require('../../models/jawaban-akrualkas');
const JawabanMutasi = require('../../models/jawaban-mutasi');

exports.akrualkas = async (input, filter) => {
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

exports.mutasiAkralkas = async (input, filter) => {
  if(filter.includes(input.ledger)) {
    
    try {
      await JawabanMutasi.updateOne({
        kdkppn: input.kppn,
        bulan: input.bulan,
        ledger: input.ledger,
        akun: input.akun
      }, {
        $inc: { nilai: input.aktivitas }
      });
    } catch (error) {
      console.log(error);
    }
  }
}