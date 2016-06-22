const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

module.exports = (app, express) => {
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(`${__dirname}./../../dist`)));
  app.use('/images', express.static(path.join(`${__dirname}./../../dist`)));
  app.use('/compressedImages', express.static(path.join(`${__dirname}./../../dist`)));
};
