const path = require('path');

const redis = require('redis');
const redisClient = redis.createClient();

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// const request = require('superagent');


const processImages = (picture, callback) => {
  var imagePath;
  if (picture.indexOf('openfoodfacts.org') !== -1) {
    imagePath = picture;
  } else {
    imagePath = path.join(`${__dirname}../../../dist/images/${picture}`);
  }
  console.log('imagePath: ', imagePath);

  imagemin([imagePath], path.join(`${__dirname}../../../dist/compressedImages`),
  { plugins: [imageminMozjpeg({ quality: 90 }),
  imageminPngquant({ quality: '65-80' })] })
  .then((files) => {
    console.log(files);
    callback(null, files[0].path);
  })
  .catch((err) => {
    console.log(err);
    callback(err, null);
  });
};

const workerJob = () => {
  process.on('message', (message) => {
    console.log('recieved message from the master', message);
  });

  const workerLoop = () => {
    redisClient.llen('compress', (err, length) => {
      if (length === 0) {
        setTimeout(workerLoop, 1000);
      } else {
        redisClient.rpop('compress', (err, taskString) => {
          process.send('processing an image: ' + taskString);
          const task = JSON.parse(taskString);
          processImages(task.imageUrl, (err, imagePath) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log('sending completed task back to database', task, imagePath);
            // request
            //   .post('')
            //   .type('form')
            //   .send({})
            //   .end((err, res) => {
            //     console.log(res);
            //   });
            setTimeout(workerLoop, 1000);
          });
        });
        workerLoop();
      }
    });
  };
  workerLoop();
};

// start the worker
workerJob();
