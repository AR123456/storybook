const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Recipe = mongoose.model("recipes");
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

router.get("/", ensureGuest, (req, res) => {
  res.render("index/welcome");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Recipe.find({ user: req.user.id }).then(recipes => {
    res.render("index/dashboard", {
      recipes: recipes
    });
  });
});

router.get("/about", (req, res) => {
  res.render("index/about");
});

module.exports = router;
