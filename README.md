This repo contains the backend of our app Drawn Together.

The front end of this project can be found here - https://github.com/kylecom21/drawn-together

# Hosting a DB using Supabase and Render
This project is hosted using [Supabase](https://supabase.com/) and [Render](https://render.com/).
These steps show how this was achieved.
## 1. Database setup using Supabase
- A new project was created on Superbase - https://supabase.com/.
- A database password was created.
- A region was selected for our hosted server.
- Next we connected to it and seeded our data.
## 2. Production .env file added to local repo
- An environment variable for our production DB called `DATABASE_URL` was created. This provides the online location of the DB we created.
- A new .env file called `.env.production` was added and gitignored to prevent our production database url from being publicly exposed.
- In it, a variable of `DATABASE_URL` with value of the URI connection string we copied from the database configuration in the previous step.
- The database password from earlier was pasted into the connection string.
## 3. Connection Pool updated
At the top of the file that creates and exports your connection pool we assigned the value of the NODE_ENV to a variable.
```js
const ENV = process.env.NODE_ENV || “development”;
```
```js
if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error(“PGDATABASE or DATABASE_URL not set”);
}
```
Next, a `config` variable was added. If the `ENV` is “production”, this variable should hold a config object, containing the `DATABASE_URL` at the `connectionString` key. This allows us to connect to the hosted database from our local machine.
```js
const ENV = process.env.NODE_ENV || “development”;
// ...
const config = {};
if (ENV === “production”) {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
}
module.exports = new Pool(config);
```
## 4. Listen file added
We added a `listen.js` file at the top level of our folder, which we provided to our hosting provider so they know how to get our app started.
```js
const app = require(“./app.js”);
const { PORT = 9090 } = process.env;
app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
```
## 5. package.json updated
In our `package.json` file, our “main” key was set to listen.js file.
```json
“main”: “listen.js”
```
The following keys were added to the scripts:
```json
{
  “scripts”: {
    “start”: “node listen.js”,
    “seed-prod”: “NODE_ENV=production npm run seed”
  }
}
```
`dotenv` and `pg` dependencies ned to be in _dependencies_, not _devDependencies_, as Render will need access to these libraries.
## 6. Changes committed to GitHub
We added, committed and pushed the changed files to our `main` branch on Github.
## 7. Online database seeding
Our `package.json` has a `seed-prod` script which needed to be run.
```bash
npm run seed-prod
```
## 8. API hosted using Render
A new Web Service was created on Render - https://render.com/.
We connected our github account and gave the app permission to access our apps repo. We could also have pasted in the URL of our git repository, as this project is a public repo.
We selected our repo and named our app.
Next we set our environment variables, adding the following variables using the `Add Environment Variable` button.
1. We set `DATABASE_URL` to our database’s URL (the same one in our `.env.production`).
2. SWe set `NODE_ENV` to the string “production” (without adding the quotes).
CWe created and deployed our service.
## 9. Checking our API online
Render provided a link to our hosted app. We checked our endpoint was working with this.
`/api/word`'