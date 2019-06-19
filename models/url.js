const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  seoOrder: {
    type: Number,
    required: true
  }
});

module.exports = URL = mongoose.model("urls", urlSchema);
