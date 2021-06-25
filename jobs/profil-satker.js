const SatkerUploadModel = require('../models/satkers-upload');
const SatkerModel = require('../models/satker-profile');
const readInterface = require('./pipe/read-interface');

const profilSatkerJob = data => {
  const path = './publics/text/satker/';
  const readLine = readInterface(path, data.files[0].filename);

  let dataSatkers = [];
  let i = 0;

  readLine.on('line', line => {
    const satkerArr = line.split(';');
    
    if(i > 0) {
      const dataSatker = {
        kdkppn: data.body.kppn,
        kode_satker: satkerArr[0],
        nama_satker: satkerArr[1],
        email: satkerArr[2],
        telpon: satkerArr[3]
      };
      dataSatkers.push(dataSatker);
    }
    i++;
  });

  readLine.on('close', async () => {
    const timestamp = new Date().
      toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' });

    let profilSatkerUpload = {
      kdkppn: data.body.kppn,
      file: data.files[0].filename,
      timestamp
    };

    try {
      await SatkerUploadModel.deleteMany({kdkppn: data.body.kppn});
      await SatkerModel.deleteMany({kdkppn: data.body.kppn});

      await SatkerUploadModel.insertMany(profilSatkerUpload);
      await SatkerModel.insertMany(dataSatkers);
    } catch (error) {
      console.log(error);
    }
  });
}

module.exports = profilSatkerJob;