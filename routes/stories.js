const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Story = mongoose.model("stories");
const User = mongoose.model("users");
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// Stories Index-  find only things with a status of public
router.get("/", (req, res) => {
  Story.find({ status: "public" })
    // bring in the feilds from user collection
    .populate("user")
    .sort({ date: "desc" })
    .then(stories => {
      // reder the view and pass the stories in
      res.render("stories/index", {
        stories: stories
      });
    });
});

// Show Single Story
router.get("/show/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
    .populate("user")
    .populate("comments.commentUser")
    .then(story => {
      if (story.status == "public") {
        res.render("stories/show", {
          story: story
        });
      } else {
        if (req.user) {
          if (req.user.id == story.user._id) {
            res.render("stories/show", {
              story: story
            });
          } else {
            res.redirect("/stories");
          }
        } else {
          res.redirect("/stories");
        }
      }
    });
});

// List stories from a user
router.get("/user/:userId", (req, res) => {
  Story.find({ user: req.params.userId, status: "public" })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    });
});

// Logged in users stories
router.get("/my", ensureAuthenticated, (req, res) => {
  Story.find({ user: req.user.id })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    });
});

// Add Story Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});

// Edit Story Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story: story
      });
    }
  });
});

// Process Add Story
router.post("/", (req, res) => {
  let allowComments;

  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  // need body parserr in app.js for this
  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };

  // Create Story
  new Story(newStory)
    .save()
    // take care of the promise
    .then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
});

// Edit Form Process
// finding the story
router.put("/:id", (req, res) => {
  // just fining one - by matching the story ID to the request params id from the url
  Story.findOne({
    _id: req.params.id
  })
    // get the story back then
    .then(story => {
      // decide if allow comments is going to be true or false
      let allowComments;

      if (req.body.allowComments) {
        allowComments = true;
      } else {
        allowComments = false;
      }

      // Set New values coming in from the form
      story.title = req.body.title;
      story.body = req.body.body;
      story.status = req.body.status;
      story.allowComments = allowComments;
      // now call the save on the new values
      story
        .save()
        // the new updaed story then redirect to the dashboard
        .then(story => {
          res.redirect("/dashboard");
        });
    });
});

// Delete Story
router.delete("/:id", (req, res) => {
  Story.remove({ _id: req.params.id }).then(() => {
    res.redirect("/dashboard");
  });
});

// Add Comment
router.post("/comment/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };

    // Add to comments array
    story.comments.unshift(newComment);

    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});

module.exports = router;
