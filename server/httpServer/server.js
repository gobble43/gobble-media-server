require('babel-polyfill');

// Load environment variables
const dotenv = require('dotenv');
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './env/development.env' });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './env/production.env' });
}

const express = require('express');

const app = express();

require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);

const server = app.listen(process.env.PORT || 3003, () => {
  console.log('listening on port: ', server.address().port);
});
