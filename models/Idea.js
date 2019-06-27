// in the model require mongoose and schema

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
// create the variable and set to new Schema  object with type and  if requried is true

const IdeaSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
// set up the export
mongoose.model("ideas", IdeaSchema);
