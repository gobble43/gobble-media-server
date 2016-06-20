const cluster = require('cluster');

const workers = {};

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
      if (message.task === 'compress') {
        workers.imageWorker.send(message);
      } else if (message.task === 'upload') {

      } else if (message.task === 'verify') {
        
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

  const masterLoop = () => {
    checkOnHTTPServer();
    checkOnImageWorker();
  };

  setInterval(masterLoop, 2000);
};

if (cluster.isMaster) {
  masterJob();
} else if (process.env.ROLE === 'http server') {
  require('./httpServer/server.js');
} else if (process.env.ROLE === 'image worker') {
  require('./imageWorker/worker.js');
}
