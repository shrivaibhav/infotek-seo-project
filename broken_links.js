const express = require("express");
const router = express.Router();
const request = require("request");
var brokenUrl = require("./models/brokenUrl");
const urlparser = require("urlparser");
const cors = require("cors");

//var linksJson = require("./link_checks.json");
//const fs = require("fs");

async function findAndWriteIntoDatabase(brokenUrlFields) {
  //using timeout so that response is sent first and then database is updated
  setTimeout(function() {
    brokenUrl
      .findOne({ _id: brokenUrlFields.url })
      .then(urlObj => {
        if (urlObj) {
          console.log("Url found in database");
          brokenUrl
            .findOneAndUpdate(
              { _id: brokenUrlFields.url },
              { $set: brokenUrlFields },
              { new: true }
            )
            .then(obj => {
              console.log("Values Updated:", obj);
            })
            .catch(err => console.log(err));
        } else {
          console.log("Url NOT found in database ... Inserting new document");
          new brokenUrl(brokenUrlFields).save().then(obj => {
            console.log("Inserted new document:", obj);
          });
        }
      })
      .catch(err => console.log("$$$", err));
  }, 5);
}

function link_check(url, callback) {
  var payload = {
    siteurl: [url]
  };
  console.log("forwarding to py");
  request.post(
    {
      url: "http://127.0.0.1:5000/getBrokenLinks",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    },
    function(err, response, body) {
      console.log("response recieved");
      if (!err) {
        var responseJson = JSON.parse(body);
        console.log(responseJson);
        // broken urls oject with url embedded
        var hostname = urlparser.parse(url).host.hostname;
        var brokenUrlFields = { _id: hostname, url: hostname, ...responseJson };
        // Find url and update or insert new in database
        findAndWriteIntoDatabase(brokenUrlFields);
        callback(responseJson);
      } else {
        // error handling
        console.log("Error in response from py:/n", err);
        callback({ error: "Error in response from py" });
      }
    }
  );
}

router.options("/", cors());
router.get("/", cors(), (req, res) => {
  //console.log(typeof req.query);
  if (req.query.site === undefined) {
    console.log("Bad Request: No site sent in params");
    return res
      .status(400)
      .json({ error: "Bad Request: No site sent in params" });
  } else {
    if (req.query.site.length <= 1) {
      console.log("Bad Request: Site length less than 1");
      return res
        .status(400)
        .json({ error: "Bad Request: Site length less than 1" });
    }
    console.log("Request Recieved: Starting Link Check Procedure");
    link_check(req.query.site, function(result) {
      // Check response at frontend for "err" key's value
      res.status(200).json(result);
      console.log("response sent");
    });
  }
});

module.exports = router;

// --------------------------------------OLD functions
// function to write into data file
// async function writeIntoLinksJson(newLinksJson) {
//   fs.exists("link_checks.json", function(exists) {
//     if (exists) {
//       fs.writeFile("link_checks.json", JSON.stringify(newLinksJson), err => {
//         if (err) {
//           console.log("error while writing into file: ", err);
//         } else {
//           console.log("link_checks dataset updated");
//         }
//       });
//     } else {
//       console.log("Dataset file doesn't exist");
//     }
//   });
// }

// function link_check_nodejs(url) {
//   var payload = {
//     siteurl: [url]
//   };
//   request.post(
//     {
//       url: "http://127.0.0.1:5000/getBrokenLinks",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(payload)
//     },
//     function(err, response, body) {
//       if (!err) {
//         var responseJson = JSON.parse(body);
//         console.log(responseJson);

//         // Find url and update or insert new in database
//         if (linksJson[url] === undefined) {
//           console.log("Site not found in dataset .. Updating dataset");
//         } else {
//           console.log("Site found in dataset .. Updating values");
//         }
//         linksJson[url] = { ...responseJson };
//         writeIntoLinksJson(linksJson);
//         console.log("data file updation started");
//       } else {
//         // error handling
//         console.log("Error in response:/n", err);
//       }
//     }
//   );
// }
// ----------------------------------
