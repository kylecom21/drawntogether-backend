const db = require("./db/connection");

function fetchWord() {
  return db.query("SELECT word FROM words").then(({ rows }) => {
    const randomIndex = Math.floor(Math.random() * rows.length)
    const randomWord = rows[randomIndex]
    return randomWord.word
  });
}

module.exports = fetchWord;
