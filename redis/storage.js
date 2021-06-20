const redisClient = require('./index');

const QUEUE = 'queue';
const PROCCESS = 'proccess';
const FILTER = 'filters';
const AKRUALKAS = 'akrualkas';
const MUTASI = 'mutasi';

exports.getQueue = () => {
  return redisClient.lrange(QUEUE, 0, -1).then(res => {
    return res.map(JSON.parse);
  });
}

exports.popQueue = () => {
  return redisClient.lpop(QUEUE).then(res => {
    return JSON.parse(res);
  });
}

exports.setQueue = queueData => {
  return redisClient.rpush(QUEUE, JSON.stringify(queueData)).then(res => {
    return res;
  });
}

exports.getProccess = () => {
  return redisClient.get(PROCCESS).then(res => {
    return res;
  });
}

exports.setProccess = value => {
  return redisClient.set(PROCCESS, value).then(res => {
    return res;
  });
}

exports.setFilterData = value => {
  return redisClient.set(FILTER, JSON.stringify(value)).then(res => {
    return res;
  });
}

exports.getFilterData = () => {
  return redisClient.get(FILTER).then(res => {
    return JSON.parse(res);
  });
}

exports.setFilterAkrualKas = value => {
  return redisClient.set(AKRUALKAS, JSON.stringify(value)).then(res => {
    return res;
  });
}

exports.getFilterAkrualKas = () => {
  return redisClient.get(AKRUALKAS).then(res => {
    return JSON.parse(res);
  });
}

exports.setFilterMutasi = value => {
  return redisClient.set(MUTASI, JSON.stringify(value)).then(res => {
    return res;
  });
}

exports.getFilterMutasi = () => {
  return redisClient.get(MUTASI).then(res => {
    return JSON.parse(res);
  });
}