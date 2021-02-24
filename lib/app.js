const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

/* eslint-disable */

app.get('/books', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT
    books.id,
    books.title,
    categories.type as category,
    books.author,
    books.category_id,
    books.price,
    books.hardcover,
    books.shipping,
    books.owner_id
    FROM books
    JOIN categories
    ON books.category_id = categories.id
    `);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(`
    SELECT
    books.id,
    books.title,
    categories.type as category,
    books.author,
    books.category_id,
    books.price,
    books.hardcover,
    books.shipping,
    books.owner_id
    FROM books
    JOIN categories
    ON books.category_id = categories.id 
    WHERE books.id=$1`, [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/books', async (req, res) => {
  // console.log(req.body);
  try {
    const data = await client.query(`INSERT INTO books (title, author, category_id, price, hardcover, shipping, owner_id)
    values ($1, $2, $3, $4, $5, $6, $7)
    returning *
    `,
      [
        req.body.title,
        req.body.author,
        req.body.category_id,
        req.body.price,
        req.body.hardcover,
        req.body.shipping,
        1
      ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.put('/books/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(`UPDATE books
    SET title = $1, author = $2, category_id = $3, price = $4, hardcover = $5, shipping = $6
    WHERE id=$7
    returning *
    `,
      [
        req.body.title,
        req.body.author,
        req.body.category_id,
        req.body.price,
        req.body.hardcover,
        req.body.shipping,
        id,
      ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('DELETE from books where id=$1 returning *', [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const data = await client.query('SELECT * from categories');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
