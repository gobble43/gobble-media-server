const cluster = require('cluster');

const workers = {};
var redisClient;

const checkOnHTTPServer = () => {
  if (workers.httpServer === undefined) {
    console.log('master starting an httpServer');
    workers.httpServer = cluster.fork({ ROLE: 'http server' });

    workers.httpServer.on('online', () => {
      console.log('http server online');
    });
    workers.httpServer.on('exit', () => {
      console.log('http server died');
      delete workers.httpServer;
    });

    workers.httpServer.on('message', (message) => {
      console.log('master recieved message from http server', message);
      if (!message.task || !message.imageUrl || !message.imageId) {
        console.log('bad task');
        return;
      }
      if (message.task === 'compress') {
        redisClient.lpush('compress', JSON.stringify(message));
      } else if (message.task === 'upload') {
        redisClient.lpush('upload', JSON.stringify(message));
      } else if (message.task === 'verify') {
        redisClient.lpush('verify', JSON.stringify(message));
      }
    });
  }
};
const checkOnImageWorker = () => {
  if (workers.imageWorker === undefined) {
    console.log('master starting an image worker');
    workers.imageWorker = cluster.fork({ ROLE: 'image worker' });

    workers.imageWorker.on('online', () => {
      console.log('image worker online');
    });
    workers.imageWorker.on('exit', () => {
      console.log('image worker died');
      delete workers.imageWorker;
    });

    workers.imageWorker.on('message', (message) => {
      console.log('master recieved message from image worker', message);
    });
  }
};

const masterJob = () => {
  console.log('master job started');

  const redis = require('redis');
  redisClient = redis.createClient();
  redisClient.on('connect', () => {
    console.log('connected to redis');

    const masterLoop = () => {
      checkOnHTTPServer();
      checkOnImageWorker();
    };

    setInterval(masterLoop, 2000);
  });
};

if (cluster.isMaster) {
  masterJob();
} else if (process.env.ROLE === 'http server') {
  require('./httpServer/server.js');
} else if (process.env.ROLE === 'image worker') {
  require('./imageWorker/worker.js');
}
