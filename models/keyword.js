const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const keywordSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  keywords: {
    type: Object,
    required: true
  }
});

module.exports = keyword = mongoose.model("keywords", keywordSchema);
