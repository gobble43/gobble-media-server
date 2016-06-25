const path = require('path');

const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const redisClient = redis.createClient();

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// const request = require('superagent');

const compressImage = (pictureName, callback) => {
  let imagePath;
  if (pictureName.indexOf('openfoodfacts.org') !== -1) {
    imagePath = pictureName;
  } else {
    imagePath = path.join(`${__dirname}../../../dist/images/${pictureName}`);
  }
  console.log('imagePath: ', imagePath);

  imagemin([imagePath], path.join(`${__dirname}../../../dist/compressedImages`),
  { plugins: [imageminMozjpeg({ quality: 90 }),
  imageminPngquant({ quality: '65-80' })] })
  .then((files) => {
    console.log(files);
    callback(null, pictureName);
  })
  .catch((err) => {
    console.log(err);
    callback(err, null);
  });
};

const compressImageAsync = Promise.promisify(compressImage);

const workerJob = () => {
  process.on('message', (message) => {
    console.log('recieved message from the master', message);
  });

  const workerLoop = () => {
    redisClient.llenAsync('compress')
      .then((length) => {
        if (length === 0) {
          setTimeout(workerLoop, 1000);
        } else {
          redisClient.rpopAsync('compress')
            .then((taskString) => {
              console.log(taskString);
              const task = JSON.parse(taskString);
              return compressImageAsync(task.imageUrl);
            })
            .then((imagePath) => {
              console.log('sending completed task back to database',
                task.task, imagePath, task.imageId);
              // request
              //   .post('')
              //   .type('form')
              //   .send({})
              //   .end((err, res) => {
              //     console.log(res);
              //   });
              workerLoop();
            })
            .catch((err) => {
              console.error(err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  workerLoop();
};

// start the worker
workerJob();
