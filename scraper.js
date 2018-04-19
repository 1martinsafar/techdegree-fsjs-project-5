"use strict";

// Modules
const express = require("express");
const app = express();

const jsonParser = require("body-parser").json;
const fs = require("fs");
// A Node.js scraper
// https://www.npmjs.com/package/scrape-it
const scrapeIt = require("scrape-it")

// A package to create an CSV file

// https://www.npmjs.com/package/csv
// https://www.npmjs.com/package/csv-generate

// https://www.npmjs.com/package/json2csv


app.use(jsonParser());

// Main Code
const isDirSync = folderPath => {
  try {
    return fs.statSync(folderPath).isDirectory();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
}

if (!isDirSync("data")) {
  fs.mkdirSync("data");
}








// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

// Setting the PORT for the API to run on
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Listening on port:", port);
});
