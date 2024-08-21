const db = require("./db/connection");

function fetchWords() {
  return db.query("SELECT word FROM words").then(({ rows }) => {
    const randomIndex = Math.floor(Math.random() * rows.length)
    const randomWord = rows[randomIndex]
    console.log(randomWord.word)
    return randomWord.word
  });
}

module.exports = fetchWords;
