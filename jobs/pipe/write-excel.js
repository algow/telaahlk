exports.writeExcelHeader = writeStream => {
  writeStream.write(
    "'" + 'KPPN' + '\t' + 
    'LEDGER' + '\t' + "'" + 
    'BANK/SATKER 1' + '\t' + "'" + 
    'BANK/SATKER' + '\t' + "'" + 
    'AKUN 1' + '\t' + "'" + 
    'AKUN 2' + '\t' + "'" + 
    'AKUN 3' + '\t' + "'" + 
    'AKUN 4' + '\t' + "'" + 
    'AKUN 5' + '\t' + "'" + 
    'AKUN 6' + '\t' + 
    'DESKRIPSI' + '\t' + 
    'SALDO AWAL' + '\t' + 
    'AKTIVITAS' + '\t' + 
    'SALDO AKHIR' + '\n'
  );
}

exports.writeExcel = (writeStream, parsedRow) => {
  writeStream.write(
    "'" + parsedRow.kppn + '\t' + 
    parsedRow.ledger + '\t' + "'" + 
    parsedRow.satker_1 + '\t' + "'" + 
    parsedRow.satker + '\t' + "'" + 
    parsedRow.akun_1 + '\t' + "'" + 
    parsedRow.akun_2 + '\t' + "'" + 
    parsedRow.akun_3 + '\t' + "'" + 
    parsedRow.akun_4 + '\t' + "'" + 
    parsedRow.akun_5 + '\t' + "'" + 
    parsedRow.akun + '\t' + 
    parsedRow.deskripsi + '\t' + 
    parsedRow.saldo_awal + '\t' + 
    parsedRow.aktivitas + '\t' + 
    parsedRow.saldo_akhir + '\n'
  );
}