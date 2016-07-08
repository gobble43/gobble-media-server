const crypto = require('crypto');
const mime = require('mime');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'dist/images/');
  },
  filename: function filename(req, file, cb) {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(null, `${raw.toString('hex')}${Date.now()}.${mime.extension(file.mimetype)}`);
    });
  },
});
const upload = multer({ storage });

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.end('Hello World!');
  });
  app.post('/api/tasks', (req, res) => {
    console.log('task body', req.body);
    if (!req.body.task) {
      return next(new Error('Bad Request: didn\'t supply a task'));
    }
    process.send(req.body);
    res.end();
  });
  app.post('/api/media', upload.single('file'), (req, res) => {
    res.statusCode = 201;
    res.end(req.file.filename);
  });
};
