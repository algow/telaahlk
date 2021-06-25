const { setMailQueue } = require('../../redis/storage');

const mailQueue = async input => {
  await setMailQueue(input);
}

module.exports = mailQueue;