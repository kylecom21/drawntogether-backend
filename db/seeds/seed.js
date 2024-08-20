const format = require("pg-format");
const db = require("../connection");

const seed = ({ wordsData, usersData }) => {
  return db
    .query(`DROP TABLE IF EXISTS words;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS user_list;`);
    })
    .then(() => {
      const wordTable = db.query(`CREATE TABLE words (
        word_id SERIAL PRIMARY KEY,
        word VARCHAR NOT NULL);`);

      const userTable = db.query(`CREATE TABLE user_list (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR NOT NULL);`);

      return Promise.all([wordTable, userTable]);
    })
    .then(() => {
      const insertWordsQueryStr = format(
        `INSERT INTO words (word) VALUES %L;`,
        wordsData.map((word) => [word])
      );
      const wordsPromise = db.query(insertWordsQueryStr);

      const insertUsersQueryStr = format(
        `INSERT INTO user_list (username) VALUES %L;`,
        usersData.map((user) => [user])
      );
      const usersPromise = db.query(insertUsersQueryStr);

      return Promise.all([usersPromise, wordsPromise]);
    });
};
module.exports = seed;