const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const recipe = mongoose.model("recipes");
const User = mongoose.model("users");
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// recipes Index-  find only things with a public of public
router.get("/", (req, res) => {
  recipe
    .find({ public: "public" })
    // bring in the feilds from user collection
    .populate("user")
    // sorting by date desending -
    .sort({ date: "desc" })
    .then(recipes => {
      // reder the view and pass the recipes in
      res.render("recipes/index", {
        recipes: recipes
      });
    });
});

// Show Single recipe
router.get("/show/:id", (req, res) => {
  recipe
    .findOne({
      _id: req.params.id
    })
    .populate("user")
    // so that user info can be accessed for commenter
    .populate("comments.commentUser")
    .then(recipe => {
      if (recipe.public == "public") {
        res.render("recipes/show", {
          recipe: recipe
        });
      } else {
        if (req.user) {
          if (req.user.id == recipe.user._id) {
            res.render("recipes/show", {
              recipe: recipe
            });
          } else {
            res.redirect("/recipes");
          }
        } else {
          res.redirect("/recipes");
        }
      }
    });
});

// List recipes from a user
router.get("/user/:userId", (req, res) => {
  recipe
    .find({ user: req.params.userId, public: "public" })
    .populate("user")
    .then(recipes => {
      res.render("recipes/index", {
        recipes: recipes
      });
    });
});

// Logged in users recipes
router.get("/my", ensureAuthenticated, (req, res) => {
  recipe
    .find({ user: req.user.id })
    .populate("user")
    .then(recipes => {
      res.render("recipes/index", {
        recipes: recipes
      });
    });
});

// Add recipe Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("recipes/add");
});

// Edit recipe Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  recipe
    .findOne({
      _id: req.params.id
    })
    .then(recipe => {
      if (recipe.user != req.user.id) {
        res.redirect("/recipes");
      } else {
        res.render("recipes/edit", {
          recipe: recipe
        });
      }
    });
});

// Process Add recipe
router.post("/", (req, res) => {
  let allowComments;

  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  // need body parserr in app.js for this
  const newRecipe = {
    public: req.body.public,
    searchTerm: req.body.searchTerm,
    userSearch: req.body.userSearch,
    url: req.body.url,
    label: req.body.label,
    image: req.body.image,
    ingredients: req.body.ingredients,
    directions: req.body.directions,
    nutrition: req.body.nutrition,
    body: req.body.body,
    allowComments: allowComments,
    user: req.user.id
  };

  // Create recipe
  new recipe(newRecipe)
    .save()
    // take care of the promise
    .then(recipe => {
      res.redirect(`/recipes/show/${recipe.id}`);
    });
});

// Edit Form Process
// finding the recipe
router.put("/:id", (req, res) => {
  // just fining one - by matching the recipe ID to the request params id from the url
  recipe
    .findOne({
      _id: req.params.id
    })
    // get the recipe back then
    .then(recipe => {
      // decide if allow comments is going to be true or false
      let allowComments;

      if (req.body.allowComments) {
        allowComments = true;
      } else {
        allowComments = false;
      }

      // Set New values coming in from the form
      recipe.public = req.body.public;
      recipe.searchTerm = req.body.searchTerm;
      recipe.userSearch = req.body.userSearch;
      recipe.url = req.body.url;
      recipe.label = req.body.label;
      recipe.image = req.body.image;
      recipe.ingredients = req.body.ingredients;
      recipe.directions = req.body.directions;
      recipe.nutrition = req.body.nutrition;
      recipe.body = req.body.body;
      recipe.allowComments = allowComments;
      // now call the save on the new values
      recipe
        .save()
        // the new updaed recipe then redirect to the dashboard
        .then(recipe => {
          res.redirect("/dashboard");
        });
    });
});

// Delete recipe
router.delete("/:id", ensureAuthenticated, (req, res) => {
  recipe.remove({ _id: req.params.id }).then(() => {
    res.redirect("/dashboard");
  });
});

// Add Comment
router.post("/comment/:id", (req, res) => {
  recipe
    .findOne({
      _id: req.params.id
    })
    .then(recipe => {
      const newComment = {
        commentBody: req.body.commentBody,
        commentUser: req.user.id
      };

      // Add to comments array - unshift adds to the beging of the comments array
      recipe.comments.unshift(newComment);

      recipe.save().then(recipe => {
        res.redirect(`/recipes/show/${recipe.id}`);
      });
    });
});

module.exports = router;
