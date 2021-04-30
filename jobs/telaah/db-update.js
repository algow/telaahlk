const JawabanModel = require('../../models/jawaban');

const updateJawaban = async (input, filter, answer) => {
  const isPerbandingan = filter.filter === 'perbandingan';

  if(isPerbandingan) {
    await perbandinganJawabanSegmenUpdate(input, filter);
  } else {
    await baseJawabanSegmenUpdate(input, filter, answer);
  }
}

module.exports = updateJawaban;


const baseJawabanSegmenUpdate = async (input, filter, answer) => {
  try {
    await JawabanModel.updateOne(
      {
        kdkppn: input.kppn,
        bulan: input.bulan,
        pertanyaan_id: filter.pertanyaan_id
      },
      { 
        $set: { jawaban: answer },
        $push: { kesalahan: input }
      }
    );  
  } catch (error) {
    // update jawaban as error
  }
}


const perbandinganJawabanSegmenUpdate = async (input, filter) => {
  try {
    if(filter.position === 'left') {
      await JawabanModel.updateOne({
        kdkppn: input.kppn,
        bulan: input.bulan,
        pertanyaan_id: filter.pertanyaan_id
      },
      { 
        $inc: { left: input.saldo_akhir }, 
        $push: { kesalahan: input }
      }
      );
    }
  
    if(filter.position === 'right') {
      await JawabanModel.updateOne({
        kdkppn: input.kppn,
        bulan: input.bulan,
        pertanyaan_id: filter.pertanyaan_id
      },
        { $inc: { right: input.saldo_akhir } }
      );
    }
  } catch (error) {
    // update jawaban as error
  }
}