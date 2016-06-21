const bodyParser = require('body-parser');
const path = require('path');

module.exports = (app, express) => {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(`${__dirname}./../../dist`)));
};
