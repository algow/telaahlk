const redisClient = require('./index');

const QUEUE = 'queue';
const PROCCESS = 'proccess';

exports.getQueue = () => {
  return redisClient.lrange(QUEUE, 0, -1).then(res => {
    return res.map(JSON.parse);
  })
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