const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
const request = require("request");
const { performance } = require("perf_hooks");
const fs = require("fs");
const urlparser = require("urlparser");

// read json files
var newjson = require("./newjson.json"); // read keywords json file
var categoryjson = require("./categoryjson.json"); // read category json
var urlsjson = require("./urlsjson.json"); // read urls json

var t0 = performance.now();

// count for running gcse once
var count = 0;

//sites1 = input from user
var sites1 = ["http://www.seoprofound.com"];
// var u = urlparser.parse(sites1[0])
// sites1[0]="https://"+u.host.hostname;

//category = user input
var category = "SEO helper";

// search into dataset for category
if (categoryjson[category] !== undefined) {
  console.log("Competitors:\n");
  for (var i = 1; i <= categoryjson[category].length; i++) {
    console.log("" + i + " - " + categoryjson[category][i]);
  }
} else {
  console.log("Not found category in category datafile or empty list");
}

// for 2nd time scraping and gcse output
var sites2 = [];
var output = [];

// Function to WRITE into Category JSON datafile
async function writeIntoCategoryJson(newCategoryJson) {
  fs.exists("categoryjson.json", function(exists) {
    if (exists) {
      fs.writeFile(
        "categoryjson.json",
        JSON.stringify(newCategoryJson),
        err => {
          if (err) {
            console.log("error while writing into file: ", err);
          } else {
            console.log("category dataset updated");
          }
        }
      );
    } else {
      console.log("Dataset file doesn't exist");
    }
  });
}

// Function to WRITE into Urls JSON datafile
async function writeIntoUrlsJson(newUrlsJson) {
  fs.exists("urlsjson.json", function(exists) {
    if (exists) {
      fs.writeFile("urlsjson.json", JSON.stringify(newUrlsJson), err => {
        if (err) {
          console.log("error while writing into file: ", err);
        } else {
          console.log("urls dataset updated");
        }
      });
    } else {
      console.log("Dataset file doesn't exist");
    }
  });
}

// Function to WRITE into NewJson JSON datafile
async function writeIntoNewJson(newjson) {
  fs.exists("newjson.json", function(exists) {
    if (exists) {
      fs.writeFile("newjson.json", JSON.stringify(newjson), err => {
        if (err) {
          console.log("error while writing into file: ", err);
        } else {
          console.log("newjson dataset updated");
        }
      });
    } else {
      console.log("Dataset file doesn't exist");
    }
  });
}

//options object
//options.num = required number of urls
const options = {
  cx: "003857855262794034673:ilic4_6yvey",
  apiKey: "AIzaSyAtwT9tjlbSz_Ne9jc_ZJ_WtVBv7q3XWS4",
  q: category,
  num: 10
};

// google custom search function
async function gcse_run(options) {
  var search_keywords = options.q.length !== 0 ? options.q : category;
  console.log("-------------------------------\n", search_keywords);
  const res = await customsearch.cse.list({
    cx: options.cx,
    q: search_keywords,
    auth: options.apiKey,
    num: options.num
  });
  console.log("-------GCSE START------");
  // console.log("-----------------------------------------");
  // console.log(res.data.searchInformation);
  // console.log("-----------------------------------------");
  if (res.data === undefined) {
    console.log("empty data from gcse");
  }
  console.log(res.data);
  if (res.data.items !== undefined) {
    // k = length of output
    var k = 0;
    // for writing new fetched urls into categoryjson file
    categoryjson[category] = [];
    for (var i = 0; i < res.data.items.length; i++) {
      var proto = "http://";
      if (res.data.items[i].link.substring(0, 8) === "https://") {
        proto = "https://";
      }
      var hostname = urlparser.parse(res.data.items[i].link).host.hostname;
      if (proto + hostname !== sites1[0] && k < 5) {
        console.log(res.data.items[i].link);
        if (!output.includes(proto + hostname)) {
          output.push(proto + hostname);
          k++;
        }
        // write into categoryjson
        categoryjson[category].push(hostname);
        // apply whois api on each site for its location
        // urlToHit = whois url + hostname
        var urlToHit =
          "https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_GOQfUnxB8q90uoAQvLGCv0FjZpcVB&outputFormat=JSON&domainName=" +
          hostname;
        var location = {};
        await request.get(urlToHit, (err, res, body) => {
          var parsedWhois = JSON.parse(body);
          if (parsedWhois["WhoisRecord"].registrant !== undefined) {
            location = {
              country: parsedWhois["WhoisRecord"].registrant.country,
              state: parsedWhois["WhoisRecord"].registrant.state
            };
          } else {
            location = { country: "Not Known", state: "Not known" };
          }
        });
        // write into urlsjson
        if (urlsjson[hostname] === undefined) {
          urlsjson[hostname] = {
            hostname: hostname,
            category: category,
            seoOrder: k,
            location: location
          };
        }
        writeIntoCategoryJson(categoryjson);
        writeIntoUrlsJson(urlsjson);
      }
    }
  } else {
    console.log("No search results found");
  }
  console.log("-------GCSE STOP------\n");
  return res.data;
}

console.log("starting..");

// function to send urls to Python script and process response
const sendForScraping = async function(category, sites, keywords_str_arr = []) {
  var keywords_arr = [];
  var siteurl = sites;
  var payload = {
    category: category,
    siteurl: siteurl
  };
  console.log("----PAYLOAD ====\n", payload);
  request.post(
    {
      url: "http://82eb66b5.ngrok.io/getSuggestions",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    },
    function(error, response, body) {
      if (!error) {
        var parsedJson = JSON.parse(body);
        var num = parsedJson.length; // num = 1 always
        for (var i = 1; i < num + 1; i++) {
          keywords_arr.push(parsedJson["" + i]);
        }
        //take min of lengths of all elements of keyword_arr
        var len = keywords_arr[0].length;
        if (len > 10) {
          for (var j = 0; j < num; j++) {
            var keywords = "";
            for (var i = 0; i < 10; i++) {
              keywords += keywords_arr[j][i] + " ";
            }
            // ---------------APPEND INTO DATASET Object HERE-------
            for (var z = 0; z < 10; z++) {
              if (newjson[category] === undefined) {
                newjson[category] = [];
              }
              newjson[category].push(keywords_arr[j][z]);
            }
            keywords_str_arr.push(keywords);
          }
          writeIntoNewJson(newjson);
        } else {
          for (var j = 0; j < num; j++) {
            var keywords = "";
            for (var i = 0; i < len; i++) {
              keywords += keywords_arr[j][i] + " ";
            }
            // ---------------APPEND INTO DATASET Object HERE-------
            for (var z = 0; z < len; z++) {
              newjson[category].push(keywords_arr[j][z]);
            }
            keywords_str_arr.push(keywords);
          }
          writeIntoNewJson(newjson);
        }
        for (var i = 0; i < keywords_str_arr.length; i++) {
          console.log(keywords_str_arr[i]);
          options.q = keywords_str_arr[i];
          count += 1;
          //var t1 = performance.now();
          //console.log("It took " + (t1 - t0) / 1000 + " seconds.");
          if (count <= 1) {
            gcse_run(options)
              .then(() => {
                foo();
              })
              .catch(console.error);
          }
          var t1 = performance.now();
          console.log("It took " + (t1 - t0) / 1000 + " seconds.");
        }
      } else console.log(error);
    }
  );
};

//send url to python script
//sendForScraping(category, sites1);
async function foo() {
  sites2 = output;
  for (var z = 0; z < output.length; z++) {
    keywords_str_arr = [];
    // make sites2[z] an array
    sendForScraping(category, [sites2[z]], keywords_str_arr);
  }
  var t1 = performance.now();
  console.log("It took " + (t1 - t0) / 1000 + " seconds.");
}

router.get("/", (req, res) => {
  //console.log(typeof req.query);
  if (req.query.site === undefined) {
    return res.status(500).json({ error: "No site sent in params" });
  } else {
    sendForScraping(req.query.category, req.query.site);
    return res.status(200).json({ msg: "request processed" });
  }
  //sendForScraping(category, sites1);
});

module.exports = router;
