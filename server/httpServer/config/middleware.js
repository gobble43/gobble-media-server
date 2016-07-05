const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

const cors = ((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, cache-control');
  next();
});

module.exports = (app, express) => {
  app.use(cors);
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(express.static(path.join(`${__dirname}./../../dist`)));
  app.use('/images', express.static(path.join(`${__dirname}./../../dist`)));
  app.use('/compressedImages', express.static(path.join(`${__dirname}./../../dist`)));
};
