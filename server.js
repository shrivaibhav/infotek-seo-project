const express = require("express");
var compression = require("compression");
const bodyParser = require("body-parser");
const competitors = require("./demo2");
const brokenLinks = require("./broken_links");
var mongoose = require("mongoose");
const mongoUri = "mongodb://127.0.0.1:27017/infotek";

const app = express();
app.use(compression());
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Node server listening on port:" + port);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    console.log("Connected to Database");
  })
  .catch(err => console.log("ERROR : Cannot connect to Database"));

app.use("/competitors", competitors);
app.use("/brokenlinks", brokenLinks);
