const express = require("express");
const router = express.Router();
const passport = require();

router.get(
  "./google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authentticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);
module.exports = router;
