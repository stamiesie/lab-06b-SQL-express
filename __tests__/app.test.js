/* eslint-disable */

require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns all books', async () => {

      const expectation = [
        {
          id: 1,
          title: 'We Begin At The End',
          author: 'Chris Whitaker',
          category: 'Fiction',
          price: 20,
          hardcover: true,
          shipping: 'yes',
          owner_id: 1
        },
        {
          id: 2,
          title: 'Building for Better Living',
          author: 'A. Quincy Jones',
          category: 'Non-Fiction',
          price: 30,
          hardcover: true,
          shipping: 'no',
          owner_id: 1
        },
        {
          id: 3,
          title: 'Fire On The Mountain',
          author: 'Edward Abbey',
          category: 'Fiction',
          price: 15,
          hardcover: true,
          shipping: 'no',
          owner_id: 1
        },
        {
          id: 4,
          title: 'The Signal',
          author: 'Ron Carlson',
          category: 'Fiction',
          price: 15,
          hardcover: false,
          shipping: 'yes',
          owner_id: 1
        },
        {
          id: 5,
          title: 'Neutra',
          author: 'Barbara Lamprecht',
          category: 'Non-Fiction',
          price: 20,
          hardcover: false,
          shipping: 'yes',
          owner_id: 1
        },
      ];

      const data = await fakeRequest(app)
        .get('/books')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });



    test('returns selected book with matching id', async () => {

      const expectation = {
        id: 1,
        title: 'We Begin At The End',
        author: 'Chris Whitaker',
        category: 'Fiction',
        price: 20,
        hardcover: true,
        shipping: 'yes',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/books/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
