/* eslint-disable */

const client = require('../lib/client');
// import our seed data:
const books = require('./books.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];



    const responses = await Promise.all(
      categoriesData.map(category => {
        return client.query(`
                        INSERT INTO categories (type)
                        VALUES ($1)
                        RETURNING *;
                    `,
          [category.type]);
      })
    );

    // const user = users[0].rows[0];

    // const categories = responses.map(({ rows }) => rows[0]);

    await Promise.all(
      books.map(book => {
        return client.query(`
                    INSERT INTO books (title, author, category_id, price, hardcover, shipping, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `,
          [
            book.title,
            book.author,
            book.category_id,
            book.price,
            book.hardcover,
            book.shipping,
            user.id
          ]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
