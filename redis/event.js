const redisClient = require('./index');
const sub = require('./subscriber');
const storage = require('./storage');
const StreamProcessing = require('../jobs/pipe/index');
// const Analyzer = require('../jobs/analyzer');
// const Analyze = require('../jobs/analyze');

const ANALYZER = 'analyzer';

const eventInit = () => {
  redisClient.on('connect', () => {
    console.log('Redis connected');
  });
  
  redisClient.on('error', () => {
    console.log('Redis connection failed');
  });
  
  sub.subscribe('analyzer', (err, count) => {
    console.log(err);
  });
  
  sub.on('message', async (channel, message) => {
    try {
      const isProccessing = await storage.getProccess();

      if(isProccessing === 'no'){
        asyncAnalyzer();
      }
    } catch (error) {
      console.log(error);
    }
  });
}

const pub = () => {
  redisClient.publish(ANALYZER, 'proses analisis');
}

exports.eventInit = eventInit;
exports.pub = pub;


const asyncAnalyzer = async () => {
  await storage.setProccess('yes');
  // await pipeProcessing();
  // await Analyzer.analyze();
  const queueData = await storage.popQueue();
  const streamProcessing = new StreamProcessing(queueData);
  await streamProcessing.init();
  await streamProcessing.run();
  await storage.setProccess('no');
  const queueNum = await storage.getQueue();

  if(queueNum.length > 0) {
    await pub();
  }
}

// class EventRedis {
//   constructor() {
//     this.pub = this.pub.bind(this);
//     this.ANALYZER = 'analyzer';
//   }

//   eventInit() {
//     redisClient.on('connect', () => {
//       console.log('Redis connected');
//     });
    
//     redisClient.on('error', () => {
//       console.log('Redis connection failed');
//     });
    
//     sub.subscribe('analyzer', (err, count) => {
//       console.log(err);
//     });
    
//     sub.on('message', async (channel, message) => {
//       try {
//         const isProccessing = await storage.getProccess();

//         if(isProccessing === 'no'){

//           await storage.setProccess('yes');
    
//           await analyzer();

//           await storage.setProccess('no');
          
//           const queueNum = await storage.getQueue();

//           if(queueNum.length > 0) {
//             await this.pub();
//           }
//         }
//       } catch (error) {
        
//       }
//     });
//   }

//   pub() {
//     console.log('PUB');
//     redisClient.publish(this.ANALYZER, 'proses analisis');
//   }
// }

