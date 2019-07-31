const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Shema
// Create Schema - schema takes in a object with then needed feilds
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Create collection and add schema
mongoose.model("users", UserSchema);
