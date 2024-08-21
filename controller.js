const fetchWord = require("./model");

function getWord(request, response) {
  fetchWord().then((word) => {
    response.status(200).send({ word });
  });
}

module.exports = getWord;
