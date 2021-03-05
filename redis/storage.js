const redisClient = require('./index');

const QUEUE = 'queue';
const PROCCESS = 'proccess';
const FILTER = 'filters';

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

exports.getFilterData = ledger => {
  return redisClient.get(FILTER, ledger).then(res => {
    return res;
  })
}