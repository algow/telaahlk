const parse = (queueData, lineArr, satker) => {
  let schema = {
    kppn: '',
    bulan: 0,
    ledger: '',
    satker_1: '',
    satker: '',
    akun_1: '',
    akun_2: '',
    akun_3: '',
    akun_4: '',
    akun_5: '',
    akun: '',
    deskripsi: '',
    saldo_awal: 0,
    aktivitas: 0,
    saldo_akhir: 0
  };

  if(lineIsData(lineArr)) {
    schema.kppn = queueData.kdkppn;
    schema.bulan = queueData.bulan;
    schema.ledger = queueData.ledger;
    schema.satker = satker;
    schema.satker_1 = satker.substr(0,1);

    schema.akun_1 = lineArr[1].substr(0,1);
    schema.akun_2 = lineArr[1].substr(0,2);
    schema.akun_3 = lineArr[1].substr(0,3);
    schema.akun_4 = lineArr[1].substr(0,4);
    schema.akun_5 = lineArr[1].substr(0,5);
    schema.akun = lineArr[1];
    schema.deskripsi = lineArr[2];

    try {
      schema.saldo_awal = parseNumber(lineArr[3]);
      schema.aktivitas = parseNumber(lineArr[4]);
      schema.saldo_akhir = parseNumber(lineArr[5]);
    } catch (error) {
      // Error logging
      console.log(queueData.kdkppn);
      console.log(lineArr);
    }

    return schema;
  }

  return {};
}


const lineIsData = lineArr => {
  if(Array.isArray(lineArr) && lineArr.length > 1) {
    if(/^[0-9]{6}/.test(lineArr[1])){
      return true;
    }
  }

  return false;
}

module.exports = { parse, lineIsData };

const parseNumber = num => {
  if(isNaN(parseInt(num.split('.').join('')))) {
    return parseInt(num.split('.').join('').slice(1, -1)) * -1;
  }
    
  return parseInt(num.split('.').join(''));
}