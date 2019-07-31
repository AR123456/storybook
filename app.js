const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
// const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
// Load Models
require("./models/User");
require("./models/Story");
// Load Routes
const index = require("./routes/index");
const auth = require("./routes/auth");
const stories = require("./routes/stories");
const users = require("./routes/users");
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

const app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MEthod Override Middelware
app.use(methodOverride("_method"));

// Handlebars Middleware
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

app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
// // for alters messages
// app.use(flash());
// // Global variables- for when flash is implemented
// app.use(function(req, res, next) {
//   res.locals.success_msg = req.flash("success_msg");
//   res.locals.error_msg = req.flash("error_msg");
//   res.locals.error = req.flash("error");
//   res.locals.user = req.user || null;
//   next();
// });
// Set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Use Routes
app.use("/", index);
app.use("/auth", auth);
app.use("/users", users);
app.use("/stories", stories);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
