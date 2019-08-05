//
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const recipe = mongoose.model("recipes");
// const scrape = mongoose.model("scrape");
const User = mongoose.model("users");
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");
// packages needed for scrape
const cheerio = require("cheerio");
const request = require("request");

// just testing connections
// router.get("/scrape", (req, res) => {
//   res.send("you hit the scrape ");
// });
///// scrape form allrecipies
// 234534   245948 238585 107421 229872 240333-kf 241564-kf 111361-kf  67952 -veg - united states  235449-veg united states
// 239498- kf , United States   178993 kf , United States  , 51856-philly-cheesesteak, 235473 garbonzo Farinata
// Making a request from the allrecipes web page
router.get("/scrape", function(req, res) {
  request("https://www.allrecipes.com/recipe/51856/", function(
    error,
    response,
    html
  ) {
    // Load the body of the HTML into cheerio
    var $ = cheerio.load(html);
    var recipe = [];
    var public = "public";
    var searchTerm = "United States";
    var userSearch = "Kid Friedly";
    /// Recipe URL
    $(".recipe-container-outer").each(function(i, element) {
      // all of the kids
      // url to the recipe
      var url = $(element)
        .children("section.ar_recipe_index")
        .find("link")
        .attr("href");
      //Recipe Title
      var label = $(element)
        .find("h1.recipe-summary__h1")
        .text();
      /////// recipe image
      var image = $(element)
        .find("img.rec-photo")
        .attr("src");
      /////// the ingrediants
      var ingredients = $(element)
        .find("span.recipe-ingred_txt")
        .text()
        .split("Add all ingredients to list")[0];
      /////// the recipe steps
      var directions = $(element)
        .find("span.recipe-directions__list--item")
        .text();
      // the nutritional info
      var nutrition = $(element)
        .find("div.nutrition-summary-facts")
        .find("span")
        // going to need some regex to get this into the db in the correct format
        // https://www.digitalocean.com/community/tutorials/how-to-index-split-and-manipulate-strings-in-javascript
        .text()
        .replace("Per Serving: ", " ");

      // If this found element had both a title and a link
      if (url) {
        // // Insert the data in the scrapedData db
        // db.recipes.insert(
        //   {
        //     public: public,
        //     searchTerm: searchTerm,
        //     userSearch: userSearch,
        //     url: url,
        //     label: label,
        //     image: image,
        //     ingredients: ingredients,
        //     directions: directions,
        //     nutrition: nutrition
        //   },
        //   function(err, inserted) {
        //     if (err) {
        //       // Log the error if one is encountered during the query
        //       console.log(err);
        //     } else {
        //       // Otherwise, log the inserted data
        //       console.log(inserted);
        //     }
        //   }
        // );
        recipe.push(
          {
            public: public,
            searchTerm: searchTerm,
            userSearch: userSearch,
            url: url,
            label: label,
            image: image,
            ingredients: ingredients,
            directions: directions,
            nutrition: nutrition
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            } else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          }
        );
      }
    });
    console.log(recipe);
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
    // Recipe.create(recipe)
    //   .then(function(dbExample) {
    //     // If saved successfully, print the new Example document to the console
    //     console.log(dbExample);
    //     res.json(dbExample);
    //   })
    //   .catch(function(err) {
    //     // If an error occurs, log the error message
    //     console.log(err.message);
    //   });
    // console.log(recipe);
    // strrecipe = JSON.stringify(recipe);
    // recipeData = JSON.parse(strrecipe);
    // console.log(recipeData);
  });

  res.send("Scrape Complete");
});

/////
module.exports = router;
