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

    // GET ALL BOOKS
    test('returns all books', async () => {

      const expectation = [
        {
          "id": 4,
          "title": "The Signal",
          "category": "Fiction",
          "author": "Ron Carlson",
          "category_id": 1,
          "price": 15,
          "hardcover": false,
          "shipping": "yes",
          "owner_id": 1
        },
        {
          "id": 3,
          "title": "Fire On The Mountain",
          "category": "Fiction",
          "author": "Edward Abbey",
          "category_id": 1,
          "price": 15,
          "hardcover": true,
          "shipping": "no",
          "owner_id": 1
        },
        {
          "id": 1,
          "title": "We Begin At The End",
          "category": "Fiction",
          "author": "Chris Whitaker",
          "category_id": 1,
          "price": 20,
          "hardcover": true,
          "shipping": "yes",
          "owner_id": 1
        },
        {
          "id": 5,
          "title": "Neutra",
          "category": "Non-Fiction",
          "author": "Barbara Lamprecht",
          "category_id": 2,
          "price": 20,
          "hardcover": false,
          "shipping": "yes",
          "owner_id": 1
        },
        {
          "id": 2,
          "title": "Building for Better Living",
          "category": "Non-Fiction",
          "author": "A. Quincy Jones",
          "category_id": 2,
          "price": 30,
          "hardcover": true,
          "shipping": "no",
          "owner_id": 1
        }
      ]

      const data = await fakeRequest(app)
        .get('/books')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // GET BOOK WITH MATCHING ID
    test('returns selected book with matching id', async () => {

      const expectation = {
        id: 1,
        title: "We Begin At The End",
        category: "Fiction",
        author: "Chris Whitaker",
        category_id: 1,
        price: 20,
        hardcover: true,
        shipping: "yes",
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/books/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // POST
    test('creates a new book and adds new book to book array', async () => {
      // define new book to create
      const newBook = {
        title: 'Dune',
        author: 'Frank Herbert',
        category_id: 1,
        price: 15,
        hardcover: false,
        shipping: 'yes',

      };
      // define what is added to newBook from SQL
      const expectedBook = {
        ...newBook,
        id: 6,
        owner_id: 1,
      };
      // create const that includes expectedBook and also the removed category from newBook that is now gone because of the JOIN
      const foundBook = {
        ...expectedBook,
        category: 'Fiction',
      }

      // use POST endpoint to create a book
      const data = await fakeRequest(app)
        .post('/books')
        // pass in new book as the req.body
        .send(newBook)
        .expect('Content-Type', /json/)
        .expect(200);
      // the POST endpoint is expected to respond with the expectedBook
      expect(data.body).toEqual(expectedBook);

      // check that newBook is in array of books
      const allBooks = await fakeRequest(app)
        // fetch entire book array
        .get('/books')
        .expect('Content-Type', /json/)
        .expect(200);

      // find newBook in book array
      const dune = allBooks.body.find(book => book.title === 'Dune');

      // 1. compare dune to newBook in database to see if they match
      // 2. now pass in the updated foundBook for expectation
      expect(dune).toEqual(foundBook);
    });

    // PUT
    test('updates a book', async () => {

      const newBook = {
        title: 'East of Eden',
        author: 'John Steinbeck',
        category_id: 1,
        price: 18,
        hardcover: true,
        shipping: 'yes'
      };

      const expectedBook = {
        ...newBook,
        id: 1,
        owner_id: 1,
      };

      // create const that includes expectedBook and also the removed category from newBook that is now gone because of the JOIN
      const foundBook = {
        ...expectedBook,
        category: 'Fiction',
      }

      await fakeRequest(app)
        .put('/books/1')
        .send(newBook)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedBook = await fakeRequest(app)
        .get('/books/1')
        .expect('Content-Type', /json/)
        .expect(200);

      // now pass in the updated foundBook for expectation
      expect(updatedBook.body).toEqual(foundBook);
    });

    // DELETE
    test('returns selected book with matching id', async () => {

      const expectation = {
        id: 4,
        title: "The Signal",
        author: "Ron Carlson",
        category_id: 1,
        price: 15,
        hardcover: false,
        shipping: "yes",
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .delete('/books/4')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const deleted = await fakeRequest(app)
        .get('/books/4')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(deleted.body).toEqual('');
    });

  });
});
