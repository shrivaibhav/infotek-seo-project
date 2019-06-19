const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const brokenUrlSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  broken_links: {
    type: Object,
    required: true
  },
  num_active_links: {
    type: Number,
    required: true
  },
  num_broken_links: {
    type: Number,
    required: true
  },
  num_redirect_links: {
    type: Number,
    required: true
  },
  num_total_links: {
    type: Number,
    required: true
  }
});

module.exports = brokenUrl = mongoose.model("brokenlinks", brokenUrlSchema);
