const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
const request = require("request");
const { performance } = require("perf_hooks");
const fs = require("fs");
const urlparser = require("urlparser");
var categoryModel = require("./models/category");
var urlModel = require("./models/url");
var keywordModel = require("./models/keyword");
const cors = require("cors");

var t0 = performance.now();

// count for running gcse once
var count = 0;

// for 2nd time scraping and gcse output
var sites1 = "";
var sites2 = [];
var output = [];
var output_hostnames = [];
var output_keywords = [];

// search into dataset for category
function searchInDatabaseForCategory(catg, callback) {
  categoryModel
    .findOne({ _id: catg })
    .then(result => {
      if (result) {
        keywordModel
          .findOne({ _id: catg })
          .then(keyword => {
            if (keyword) {
              callback({
                category: catg,
                urls: result.urls,
                keywords: keyword.keywords
              });
              console.log("Response sent -------");
              console.log(result);
            }
          })
          .catch(err => console.log("keyword search DB error", err));
      }
    })
    .catch(err => console.log("competitors search DB error", err));
}

function writeCategoryToDatabase(category, urls) {
  categoryModel
    .findOne({ category: category })
    .then(catgObj => {
      if (catgObj) {
        console.log("Competitors found in database ..Now updating");
        var obj = { _id: category, category: category, urls: urls };
        categoryModel
          .findOneAndUpdate({ _id: category }, { $set: obj }, { new: true })
          .then(obj => {
            console.log("Values Updated:", obj);
          })
          .catch(err => console.log(err));
      } else {
        console.log(
          "Competitors (category) NOT found in database ... Inserting new document"
        );
        new categoryModel({ _id: category, category: category, urls: urls })
          .save()
          .then(obj => {
            console.log("Inserted new category document:", obj);
          })
          .catch(err => {
            console.log("$Category$", err);
          });
      }
    })
    .catch(err => console.log("$$Category$$", err));
}

function writeUrlToDatabase(url_hostname, urlObj) {
  urlModel
    .findOne({ _id: url_hostname })
    .then(url => {
      if (url) {
        console.log("Url found in database ..Now updating");
        urlModel
          .findOneAndUpdate(
            { _id: url_hostname },
            { $set: urlObj },
            { new: true }
          )
          .then(obj => {
            console.log("Values Updated:", obj);
          })
          .catch(err => console.log(err));
      } else {
        console.log("Url NOT found in database ... Inserting new document");
        new urlModel(urlObj)
          .save()
          .then(obj => {
            console.log("Inserted new category document:", obj);
          })
          .catch(err => {
            console.log("$Url$", err);
          });
      }
    })
    .catch(err => console.log("$$Url$$", err));
}

function writeKeywordsToDatabase(category, keywords) {
  keywordModel
    .findOne({ category: category })
    .then(keyword => {
      if (keyword) {
        console.log("Competitors found in database ..Now updating");
        var obj = { _id: category, category: category, keywords: keywords };
        keywordModel
          .findOneAndUpdate({ _id: category }, { $set: obj }, { new: true })
          .then(obj => {
            console.log("Values Updated:", obj);
          })
          .catch(err => console.log(err));
      } else {
        console.log(
          "Competitors (category) NOT found in database ... Inserting new document"
        );
        new keywordModel({
          _id: category,
          category: category,
          keywords: keywords
        })
          .save()
          .then(obj => {
            console.log("Inserted new category document:", obj);
          })
          .catch(err => {
            console.log("$Keywords$", err);
          });
      }
    })
    .catch(err => console.log("$$Keywords$$", err));
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
async function gcse_run(options, catg, callback) {
  var search_keywords = options.q.length !== 0 ? options.q : catg;
  console.log("-------------------------------\n", search_keywords);
  const res = await customsearch.cse.list({
    cx: options.cx,
    q: search_keywords,
    auth: options.apiKey,
    num: options.num
  });
  console.log("-------GCSE START------");
  if (res.data === undefined) {
    callback({ error: "empty data from gcse" });
  }
  //console.log(res.data);
  if (res.data.items !== undefined) {
    // k = length of output
    var k = 0;
    var input_site_hostname = urlparser.parse(sites1[0]).host.hostname;
    if (input_site_hostname.substring(0, 4) !== "www.") {
      input_site_hostname = "www." + input_site_hostname;
    }
    for (var i = 0; i < res.data.items.length; i++) {
      // protocol
      var proto = "http://";
      if (res.data.items[i].link.substring(0, 8) === "https://") {
        proto = "https://";
      }
      var hostname = urlparser.parse(res.data.items[i].link).host.hostname;
      if (hostname !== input_site_hostname && k < 5) {
        console.log(res.data.items[i].link);
        if (!output.includes(proto + hostname)) {
          output.push(proto + hostname);
          output_hostnames.push(hostname);
          k++;
        }
      }
    }
  } else {
    callback({ error: "No results found in GCSE search" });
    console.log("No search results found");
  }
  console.log("-------GCSE STOP------\n");
  return res.data;
}

console.log("starting..");

var scrapingCount = 0;
// send response to frontend after total 6 times scraping --------------------
function scrapingCountIncAndResp(callback, catg) {
  scrapingCount = scrapingCount + 1;
  if (scrapingCount === 6) {
    // pass result in callback
    console.log("CHECKPOINT 3 $$$$$$$$$$$$$$$$$$$$$");
    callback({
      category: catg,
      urls: output_hostnames,
      keywords: output_keywords
    });
    writeCategoryToDatabase(catg, output_hostnames);
    for (var i = 0; i < output_hostnames.length; i++) {
      var urlObject = {
        _id: output_hostnames[i],
        url: output_hostnames[i],
        category: catg,
        seoOrder: i + 1
      };
      writeUrlToDatabase(output_hostnames[i], urlObject);
    }
    writeKeywordsToDatabase(catg, output_keywords);
  }
}

// function to send urls to Python script and process response
const sendForScraping = async function(
  catg,
  sites,
  keywords_str_arr = [],
  callback
) {
  var keywords_arr = [];
  var siteurl = sites;
  var payload = {
    category: catg,
    siteurl: typeof siteurl === "object" ? siteurl : [siteurl]
  };
  console.log("----PAYLOAD ====\n", payload);
  request.post(
    {
      url: "http://127.0.0.1:5000/getSuggestions",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    },
    function(error, response, body) {
      console.log("----============");
      if (response !== undefined) {
        console.log("response recieved");
      }
      console.log("----============");
      if (!error) {
        console.log("CHECKPOINT 1 $$$$$$$$$$$$$$$$$$$$$");
        var parsedJson = JSON.parse(body);
        console.log("----============");
        console.log(parsedJson);
        console.log("----============");
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
              // push each keyword in output_keywords
              if (scrapingCount !== 0) {
                output_keywords.push(keywords_arr[j][i]);
              }
            }
            keywords_str_arr.push(keywords);
          }
        } else {
          for (var j = 0; j < num; j++) {
            var keywords = "";
            for (var i = 0; i < len; i++) {
              keywords += keywords_arr[j][i] + " ";
            }
            keywords_str_arr.push(keywords);
          }
        }
        for (var i = 0; i < keywords_str_arr.length; i++) {
          options.q = keywords_str_arr[i];
          count += 1;
          if (count <= 1) {
            console.log("CHECKPOINT =========$$$$$$$$$$$");
            gcse_run(options, catg, callback)
              .then(() => {
                foo(catg, callback);
              })
              .catch(err => {
                console.log("$$$$");
                console.log(err);
              });
          }
          console.log("CHECKPOINT 2 $$$$$$$$$$$$$$$$$$$$$");
          // call scrapingCountIncAndResp to increment count
          scrapingCountIncAndResp(callback, catg);
          var t1 = performance.now();
          console.log("It took " + (t1 - t0) / 1000 + " seconds.");
        }
      } else {
        callback({ error: "Could not send for scraping to python script" });
      }
    }
  );
};

//send url to python script
//sendForScraping(category, sites1);
async function foo(catg, callback) {
  sites2 = output;
  for (var z = 0; z < output.length; z++) {
    keywords_str_arr = [];
    // make sites2[z] an array
    sendForScraping(catg, [sites2[z]], keywords_str_arr, callback);
  }
  var t1 = performance.now();
  console.log("It took " + (t1 - t0) / 1000 + " seconds.");
}

router.options("/", cors());
router.get("/", cors(), (req, res) => {
  console.log("");
  console.log("");
  console.log("Request recieved");
  var finalResponseSent = false;
  scrapingCount = 0;
  count = 0;
  //console.log(typeof req.query);
  if (req.query.site === undefined || req.query.category === undefined) {
    return res
      .status(400)
      .json({ error: "Bad Request: No site or category sent in params" });
  } else {
    if (req.query.site.length <= 1 || req.query.category.length <= 1) {
      console.log("Bad Request: Site or category length less than 1");
      return res
        .status(400)
        .json({ error: "Bad Request: Site or category length less than 1" });
    }
    sites1 = [req.query.site];
    searchInDatabaseForCategory(req.query.category, function(result) {
      res.json(result);
      finalResponseSent = true;
    });
    var keywords_str_arr = [];
    sendForScraping(
      req.query.category,
      req.query.site,
      keywords_str_arr,
      function(result) {
        if (finalResponseSent === false) {
          res.status(200).json(result);
          finalResponseSent = true;
        }
      }
    );
    //return res.status(200).json({ msg: "request processed" });
  }
});

module.exports = router;
