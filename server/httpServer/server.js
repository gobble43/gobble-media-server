const express = require('express');

const app = express();

require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);

const server = app.listen(process.env.PORT || 3003, () => {
  console.log('listening on port: ', server.address().port);
});
