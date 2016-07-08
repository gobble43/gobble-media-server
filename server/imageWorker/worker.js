const path = require('path');
const fetchUtils = require('./../httpServer/config/fetch-utils.js');
const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const redisClient = redis.createClient();

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

const fetch = require('isomorphic-fetch');
const dotenv = require('dotenv');
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './env/development.env' });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './env/production.env' });
}
const gobbleDBUrl = process.env.GOBBLE_DB_URL;
console.log(gobbleDBUrl);

const compressImage = (pictureName, callback) => {
  let imagePath;
  if (pictureName.indexOf('openfoodfacts.org') !== -1) {
    imagePath = pictureName;
  } else {
    imagePath = path.resolve(__dirname, `../../dist/images/${pictureName}`);
  }

  imagemin([imagePath], path.resolve(__dirname, '../../dist/compressedImages'),
  { plugins: [imageminMozjpeg({ quality: 90 }),
  imageminPngquant({ quality: '65-80' })] })
  .then((files) => {
    console.log('compressed file', files);
    callback(null, pictureName);
  })
  .catch((err) => {
    console.log(err);
    callback(err, null);
  });
};

const compressImageAsync = Promise.promisify(compressImage);

const compressionWorker = () => {
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
              const task = JSON.parse(taskString);
              return Promise.all([task.imageId, compressImageAsync(task.imageUrl)]);
            })
            .then((results) => {
              console.log('sending completed task back to database',
                 results[0], results[1]);
              fetch(`${gobbleDBUrl}/db/compressMedia`, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageId: results[0], compressedUrl: results[1] }),
              })
              .then()
              .catch(err => {
                console.err(`Error posting compressed images to gobble-db Error: ${err}`);
              });
              workerLoop();
            })
            .catch((err) => {
              workerLoop();
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

const fetchImagesWorker = () => {
  console.log('started fetching');
  const workerLoop = () => {
    fetch(`${gobbleDBUrl}/db/compressMedia`)
    .then(response => fetchUtils.checkStatus(response))
    .then((body) => {
      console.log('new images to compress: ', body);
      for (let i = 0; i < body.length; i++) {
        redisClient.lpushAsync('compress', JSON.stringify(body[i]));
      }
      setTimeout(workerLoop, 10000);
    })
    .catch(err => {
      console.err(`Error fetching uncompressed images from gobble-db Error: ${err}`);
    });
  };
  workerLoop();
};

// start fetching images for the worker
fetchImagesWorker();
// start the compression worker
compressionWorker();
