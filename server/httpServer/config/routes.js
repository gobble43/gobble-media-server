const path = require('path');
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
    res.end('hello');
  });
  app.post('/api/images', upload.single('file'), (req, res) => {
    res.end(req.file.filename);
  });
};
