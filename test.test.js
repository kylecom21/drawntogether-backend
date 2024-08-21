const app = require("./app");
const request = require("supertest");
const db = require("./db/connection");
const seed = require("./db/seeds/seed");
const data = require("./db/development-data/index");

beforeAll(() => {
  return seed(data);
});
afterAll(() => {
  return db.end();
});

describe("/api/word", () => {
    test("GET 200: Should return the a single random word passed with the following properties", () => {
      return request(app)
        .get("/api/word")
        .expect(200)
        .then(({ body }) => {
          expect(body.word).toEqual(expect.any(String)); 
        });
    });
  });
