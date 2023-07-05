//imports
//o ultimo empregado da minha familia
const express = require("express");
const { Pool, Client } = require("pg");
const credentials = require("./credentials.js");
const bodyParser = require("body-parser");
const pool = require("./connection");

pool.connect();

const app = express();

// async function poolDemo() {
//     const pool = new Pool(credentials);
//     const now = await pool.query("SELECT NOW()");
//     await pool.end();

//     return now
// }

// async function clientDemo(){
//     const client = new Client(credentials);
//     await client.connect();
//     const now = await client.query("SELECT NOW()");
//     await client.end();

//     return now;
// }

// (async () => {
//     const now = await poolDemo();
//     console.log(now.rows[0].now);

//     const clientResult = await clientDemo();
//     console.log(clientResult.rows[0].now);

// })();

app.use(bodyParser.json());

const routes = require("./routes/routes.js");

app.use("/", routes);

//  404 ERROR
app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

//CATCH OTHER ERRORS
app.use((err, req, res, next) => {
  const message = err;
  const status = err.status || 500;

  res.status(status).json({
    error: {
      message: err.message,
    },
  });
});

//start server
const port = 8080;
app.listen(port, () => console.log(`Server started on port ${port}`));
