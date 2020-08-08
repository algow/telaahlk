const incomingData = { 
  kppn: '156',
  ledger: 'Accrual_SATKER',
  satker: '999173',
  akun: '111611',
  deskripsi: 'Diterima dari Entitas Lain',
  saldo_awal: 0,
  aktivitas: 552705052,
  saldo_akhir: -552705052 
}

const dbSoalJawaban = {
  '1': true,
  '4': true
}

const blacklistedDoubleFilter = {
  '^111[0-9]{3}': {
    soal_id: 1,
    must: 'negative',
    at: 'saldo_akhir',
    kategori: 'Accrual_SATKER'
  },
  '212145': {
    soal_id: 4,
    must: 'positive',
    at: 'saldo_akhir',
    kategori: 'Accrual_SATKER'
  }
}

const blacklistedSingleFilter = {
  '^111[0-9]{3}': {
    soal_id: 1,
    must: 'positive',
    at: 'saldo_akhir',
    kategori: 'Accrual_SATKER',
    answer: true
  },
  '212145': {
    soal_id: 4,
    must: 'negative',
    at: 'saldo_akhir',
    kategori: 'Accrual_SATKER',
    answer: true
  }
}

const akunIsBlacklist = () => {
  Object.keys(blacklistedDoubleFilter).forEach(blacklistKey => {
    
  });

  Object.keys(blacklistedSingleFilter).forEach(blacklistKey => {
    const regex = RegExp(blacklistKey);

    if(regex.test(incomingData.akun)) {
      const answer = falsyAnalyzer(incomingData, blacklistedSingleFilter[blacklistKey]);

      blacklistedSingleFilter[blacklistKey]['answer'] = answer;
      dbSoalJawaban[blacklistedSingleFilter[blacklistKey]['soal_id']] = answer;

      console.log(blacklistedSingleFilter);
      console.log(dbSoalJawaban);
    }
  });
}

const falsyAnalyzer = (analyzee, filter) => {
  if(filter.must === 'negative'){
    return analyzee[filter['at']] < 0;
  }

  if(filter.must === 'positive'){
    return analyzee[filter['at']] >= 0;
  }
}

akunIsBlacklist();

// const data = {
//   156: {
//     Accrual_BANK: {
//       111511: [
//         { kppn: '156', ledger: 'Accrual_BANK', satker: 'N0517', akun: '111511', deskripsi: 'Kas dalam Transito - BUN', saldo_awal: 35148019000,aktivitas: 0, saldo_akhir: 35148019000 }
//       ],
//       511228:[
//         { kppn: '156',ledger: 'Accrual_BANK',satker: '00000',akun: '511228',deskripsi: 'Belanja Tunj. Lauk pauk TNI/P',saldo_awal: 0,aktivitas: 9198660000,saldo_akhir: 9198660000 }
//       ]
//     },
//     Accrual_SATKER: [
//       { kppn: '156',ledger: 'Accrual_SATKER',satker: '999173',akun: '313121',deskripsi: 'Diterima dari Entitas Lain',saldo_awal: 0,aktivitas: 552705052,saldo_akhir: 552705052 },
//       { kppn: '156',ledger: 'Accrual_SATKER',satker: '677559',akun: '425412',deskripsi: 'Pendapatan Biaya Pendidikan',saldo_awal: 0,aktivitas: -10437730000,saldo_akhir: -10437730000 },
//       { kppn: '156',ledger: 'Accrual_SATKER',satker: '673694',akun: '511123',deskripsi: 'Belanja Tunj. Struktural PNS',saldo_awal: 0,aktivitas: 6300000,saldo_akhir: 6300000 }
//     ],
//     Cash_BANK: [
//       { kppn: '156',ledger: 'Cash_BANK',satker: 'O0264',akun: '533111',deskripsi: 'Belanja Modal Gedung dan Bang',saldo_awal: 0,aktivitas: 11223379400,saldo_akhir: 11223379400 },
//       { kppn: '156',ledger: 'Cash_BANK',satker: 'F0600',akun: '521219',deskripsi: 'Belanja Barang Non Operasiona',saldo_awal: 0,aktivitas: 24224000,saldo_akhir: 24224000 },
//       { kppn: '156',ledger: 'Cash_BANK',satker: 'F0602',akun: '511122',deskripsi: 'Belanja Tunj. Anak PNS',saldo_awal: 0,aktivitas: 6728294,saldo_akhir: 6728294 }
//     ],
//     Cash_SATKER: [
//       { kppn: '156',ledger: 'Cash_SATKER',satker: '999173',akun: '827111',deskripsi: 'Pengeluaran Non Anggaran Piha',saldo_awal: 0,aktivitas: 276352526,saldo_akhir: 276352526 },
//       { kppn: '156',ledger: 'Cash_SATKER',satker: '677559',akun: '425412',deskripsi: 'Pendapatan Biaya Pendidikan',saldo_awal: 0,aktivitas: -10437730000,saldo_akhir: -10437730000 },
//       { kppn: '156',ledger: 'Cash_SATKER',satker: '677559',akun: '511124',deskripsi: 'Belanja Tunj. Fungsional PNS',saldo_awal: 0,aktivitas: 226148000,saldo_akhir: 226148000 }
//     ]
//   }
// };

// console.log(data[156]['Accrual_BANK'][/^111[0-9]{3}/])