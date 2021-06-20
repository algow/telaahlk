const DownloadModel = require('../../models/download');
const JawabanModel = require('../../models/jawaban');

exports.finishingStuffs = async (kdkppn, bulan, filename) => {
  await testJawabanPerbandingan(kdkppn, bulan);
  await updateDownload(kdkppn, bulan, filename);
}

const testJawabanPerbandingan = async (kdkppn, bulan) => {
  const perbandingan = await JawabanModel.find({
    kdkppn,
    bulan,
    filter: 'perbandingan'
  });

  perbandingan.forEach(async item => {
    let jawaban;

    if(item.sign === 'greater'){
      jawaban = item.left >= item.right;
    }

    if(item.sign === 'equal'){
      jawaban = item.left === item.right;
    }

    await JawabanModel.updateOne({
      kdkppn: item.kdkppn,
      bulan: item.bulan,
      pertanyaan_id: item.pertanyaan_id
    }, 
      { $set: { jawaban: jawaban }
    });
  });
}

const updateDownload = async (kdkppn, bulan, filename) => {
  const timestamp = new Date().
    toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' })

  try {
    await DownloadModel.deleteMany({kdkppn, bulan});

    const download = new DownloadModel({
      kdkppn,
      bulan,
      file: filename,
      timestamp
    });
    download.save();
    
  } catch (error) {
    console.log(error);
  }
}