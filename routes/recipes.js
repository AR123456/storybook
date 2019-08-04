const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const recipe = mongoose.model("recipes");
const User = mongoose.model("users");
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// recipes Index-  find only things with a status of public
router.get("/", (req, res) => {
  recipe
    .find({ status: "public" })
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
      if (recipe.status == "public") {
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
    .find({ user: req.params.userId, status: "public" })
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
  const newrecipe = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };

  // Create recipe
  new recipe(newrecipe)
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
      recipe.title = req.body.title;
      recipe.body = req.body.body;
      recipe.status = req.body.status;
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
