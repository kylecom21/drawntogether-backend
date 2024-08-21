const fetchWords = require("./model");

function getWords(request, response) {
  fetchWords().then((word) => {
    response.status(200).send({ word });
  });
}

module.exports = getWords;
