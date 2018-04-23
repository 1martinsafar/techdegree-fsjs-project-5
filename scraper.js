"use strict";

/* ======================================================================
                        MODULES
========================================================================= */
const express = require("express");
const app = express();

const fs = require("fs");

// A Node.js scraper: https://www.npmjs.com/package/scrape-it
const scrapeIt = require("scrape-it");

// A package to create an CSV file: https://www.npmjs.com/package/json2csv
const Json2csvParser = require('json2csv').Parser;
const fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

/* ======================================================================
                        FUNCTIONS
========================================================================= */

// If the speficied folder does not exist, it creates it
const accessFolder = folderPath => {
  try {
    return fs.statSync(folderPath).isDirectory();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
};

// Check if a file exists. If not, create an empty file with the specified name
// note: currently not used
const accessFile = name => {
  fs.stat(name, function(err, stat) {
      if (err === null) {
          console.log('File exists');
      } else if (err.code === 'ENOENT') {
          console.log("File does not exist");
          fs.writeFile(name, "");
      } else {
          console.log('An error has occured:', err.code);
      }
  });
};

// When an error occurs, log it to a file named scraper-error.log
// It appends to the bottom of the file with a time stamp and error
const logError = msg => {
  const now = new Date();
  fs.appendFile('./data/scraper-error.log', `[${now}] <${msg}>\n\n`, (err) => {
  if (err) throw err;
  console.log('___The error was appended to file!');
});
};

// Returns the current date in format: YYYY-MM-DD
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  let month = '' + (now.getMonth() + 1);
  let day = '' + now.getDate();
  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }
  const currentDate = [year, month, day].join('-');
  return currentDate;
};

// Scrapes the title, price, image url and page url from each shirt product,
// stores it in a CSV file, can be used by another app to populate a database
// note: if the program is run twice, it should overwrite the CSV file
const getProductDetails = () => {
  scrapeIt("http://shirts4mike.com/shirts.php", {
    // Get the url for each product page
    products: {
      listItem: ".products li",
      data: {
        url: {
          selector: "a",
          attr: "href"
        }
      }
    }
  }).then(({ data, response }) => {
      console.log(`Status Code: ${response.statusCode}`);
      // Access each product's URL and get the title, price, image url
      const urls = [];
      data.products.forEach(data => {
        const url = data.url;
        urls.push(url);
      });
      const allDetails = [];
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        getProductInfo(url, allDetails);
      }
      // Using this to gather all the details and
      // write it to a CSV file all at once
      // note: not sure how to do it properly using a different method
      // such as async and await
      setTimeout(() => {
        // console.log(allDetails);
        const json2csvParser = new Json2csvParser({ fields });
        const csv = json2csvParser.parse(allDetails);
        // console.log(csv);
        const currentDate = getCurrentDate();
        const savePath = `./data/${currentDate}.csv`;
        // console.log("savePath:\n", savePath);
        fs.writeFile(savePath, csv, err => {
          if (err) {
            throw err;
          } else {
            console.log(">>> CSV file saved!");
          }
        });
      },1000);
  })
  .catch ( err => {
    console.log("There’s been a 404 error. Cannot connect to the to http://shirts4mike.com.");
    logError(err);
  });
};

// Gets the shirt details from each shirt product
const getProductInfo = (url, allDetails) => {
  const fullUrl = `http://shirts4mike.com/${url}`;
  scrapeIt(fullUrl, {
    // Get the title, price and image url from a product
    shirts: {
      listItem: ".shirt-picture",
      data: {
        title: {
          selector: "img",
          attr: "alt"
        },
        imageUrl: {
          selector: "img",
          attr: "src"
        }
      }
    },
    price: ".price"
  }).then(({ data, response }) => {
      console.log(`Status Code: ${response.statusCode}`);
      // Collecting: title, price, image url, url for each product
      const currentDate = getCurrentDate();
      const image = `http://shirts4mike.com/${data.shirts[0].imageUrl}`;
      const details = {
        Title: data.shirts[0].title,
        Price: data.price,
        ImageURL: image,
        URL: fullUrl,
        Time: currentDate
      };
      allDetails.push(details);
  })
  .catch ( err => {
    console.log("There’s been a 404 error. Cannot connect to the to http://shirts4mike.com.");
    logError(err);
  });
};

/* ======================================================================
                        MAIN CODE
========================================================================= */

// Scraping details for shirt products, saving it to a CSV file

getProductDetails();

if (!accessFolder("data")) {
  fs.mkdirSync("data");
}

// note: currently no HTML content for this app available

// // Catch 404 and forward to error handler
// app.use((req, res, next) => {
//   const err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });
//
// // Error handler
// app.use((err, req, res, next) => {
//   res.status(err.status || 500);
//   res.json({
//     error: {
//       message: err.message
//     }
//   });
// });

// Setting the PORT for the app to run on
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Listening on port:", port);
});
