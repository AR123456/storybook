const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
// for put and del from html forms
const methodOverride = require("method-override");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
// new consts added for scrape
const cheerio = require("cheerio");
const request = require("request");
///

const app = express();
// Load Models
require("./models/User");
require("./models/Recipe");
// require("./models/Scrape");
// Load Routes
const index = require("./routes/index");
const auth = require("./routes/auth");
const recipes = require("./routes/recipes");
const users = require("./routes/users");
const scrape = require("./routes/scrape");
// Passport Config
require("./config/passport")(passport);
// Load Keys
const keys = require("./config/keys");
// Handlebars Helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require("./helpers/hbs");

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose
  .connect(keys.mongoURI, {
    useMongoClient: true
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handlebars Middleware - with healpers added
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      truncate: truncate,
      stripTags: stripTags,
      formatDate: formatDate,
      select: select,
      editIcon: editIcon
    },
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware - for put and del  from simple html forms
app.use(methodOverride("_method"));

app.use(cookieParser());
// Express session midleware-- make sure this is above the passport middleware
app.use(
  session({
    // secret can be anything
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
// for alters messages
app.use(flash());
// Global variables- for when flash is implemented
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});
// Set global user variable so that it is in app.js vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Set static folder using path
app.use(express.static(path.join(__dirname, "public")));

// Use Routes
app.use("/", index);
app.use("/auth", auth);
app.use("/users", users);
app.use("/recipes", recipes);
app.use("/scrape", scrape);

// this works
// app.get("/scrape", function(req, res) {
//   res.send("hello world");
// });

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
