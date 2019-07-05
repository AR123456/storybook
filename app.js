const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
// passport config
require("./config/passport")(passport);

//load routes
const auth = require("./routes/auth");
//load Keys
const keys = require("./config/keys");
//mongoose Connect
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose
  // if working with the depolyed app use
  // .connect(keys.mongoURI, { useMongoClient: true })
  .connect("mongodb://localhost/storybook", {
    // useMongoClient: true
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));
const app = express();

app.get("/", (req, res) => {
  res.send("It Works!");
});

app.use("/auth", auth);
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
