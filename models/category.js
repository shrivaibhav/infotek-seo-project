const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  urls: {
    type: Object,
    required: true
  }
});

module.exports = category = mongoose.model("competitors", categorySchema);
