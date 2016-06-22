require('./setup');
const expect = require('chai').expect;
const path = require('path');

// We're using supertest, which allows for use of any super-agent methods
// and really easy HTTP assertions.
// See https://www.npmjs.com/package/supertest for a better reference
const appUrl = `${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}`;
const request = require('supertest');

describe('Gobble Media Server', () => {
  describe('Basic GET Request', () => {
    it('should return status code 200 and "Hello, World!"', (done) => {
      request(appUrl)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200, 'Hello World!')
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
  describe('Image upload', () => {
    it('should return the url of the uploaded image on the server', (done) => {
      request(appUrl)
        .post('/api/images')
        .set('Accept', 'application/json')
        .attach('file', path.resolve(`${__dirname}/test-files/1.jpeg`))
        .expect(201)
        .end((err, res) => {
          expect(res.text).to.be.a('string');
          if (err) return done(err);
          return done();
        });
    });
  });
  // More tests (as in A LOT more!) and describe blocks below
});
