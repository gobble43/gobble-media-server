const path = require('path');

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// const request = require('superagent');

const processImages = (picture, callback) => {
  var imagePath;
  if (picture.indexOf('openfoodfacts.org')) {
    imagePath = picture;
  } else {
    imagePath = path.join(__dirname + '../../dist/images/' + picture);
  }
  imagemin([imagePath], path.join(__dirname + '../../dist/compressed'),
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
  const processStack = [];
  process.on('message', (message) => {
    console.log('adding new task to image worker');
    processStack.push({ imageId: message.imageId, imageUrl: message.imageUrl });
  });


  const workerLoop = () => {
    if (processStack.length === 0) {
      setTimeout(workerLoop, 1000);
    } else {
      const task = processStack.pop();
      process.send('processing an image');
      processImages(task, (imagePath) => {
        console.log('sending completed task back to database', task, imagePath);
        // request
        //   .post('')
        //   .type('form')
        //   .send({})
        //   .end((err, res) => {
        //     console.log(res);
        //   });
      });
    }
    setTimeout(workerLoop, 1000);
  };
  workerLoop();
};

// start the worker
workerJob();
