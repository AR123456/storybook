const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();

// User Model
require("../models/User");
const User = mongoose.model("users");

// User Login Route
router.get("/login", (req, res) => {
  res.render("users/login");
});

// User Register Route
router.get("/register", (req, res) => {
  res.render("users/register");
});
// //////////////////////////login form Post //////////////////////
router.post("/login", (req, res, next) => {
  //passport stuff here

  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/"
    // failureFlash: true
  })(req, res, next);
});

// Register fromm POST
router.post("/register", (req, res) => {
  // console.log(req.body);
  // res.send("register");
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({ text: "Passwords do not match" });
  }

  if (req.body.password.length < 4) {
    errors.push({ text: "Password must be at least 4 characters" });
  }

  if (errors.length > 0) {
    res.render("users/register", {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        req.flash("error_msg", "Email is already registered");
        res.redirect("/users/login");
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                // req.flash("success_msg", "You are registered and can log in");
                res.redirect("/users/login");
              })
              .catch(err => {
                console.log(err);
                return;
              });
          });
        });
      }
    });
  }
});
//logout user
router.get("/logout", (req, res) => {
  req.logOut();
  // req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;

//****************************************************************************************************** */
// const express = require('express');
// const router = express.Router();
// const passport = require('passport');

// router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),(req, res) => {
//     res.redirect('/dashboard');
//   });

// router.get('/verify', (req, res) => {
//   if(req.user){
//     console.log(req.user);
//   } else {
//     console.log('Not Auth');
//   }
// });

// router.get('/logout', (req, res) => {
//  req.logout();
//  res.redirect('/');
// });

// module.exports = router;
