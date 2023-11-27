const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const { Client } = require("pg");
var pg = require("pg");

const klient = new Client({
  user: "unuklejt",
  host: "cornelius.db.elephantsql.com",
  database: "unuklejt",
  password: "Z5NH7zyiMpplaW6mEOTWyWqTM50a-11s",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

const valuesQry = "SELECT * FROM value_pr_countrY";
const activityFatalQry = "SELECT * FROM activity_fatality";

klient.connect();

// Enable CORS for all routes
app.use(cors());

app.get("/values", async (req, res) => {
  try {
    let queryData = await klient.query(valuesQry);

    res.json({
      ok: true,
      attacks: queryData.rows,
    });
  } catch (error) {
    res.json({
      ok: false,
      message: error.message,
    });
  }
});

app.get("/activities-fatal", async (req, res) => {
  try {
    let queryData = await klient.query(activityFatalQry);
    res.json(queryData.rows);
  } catch (error) {
    res.json({
      ok: false,
      message: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
