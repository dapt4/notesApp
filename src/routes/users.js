const express = require("express");
const router = express.Router();
const User = require("../models/User");
const passport = require("passport");

router.get("/users/signin", (req, res) => {
  res.render("users/signin");
});

router.post(
  "/users/signin",
  passport.authenticate("local", {
    successRedirect: "/notes",
    failureRedirect: "/users/signin",
    failureFlash: true,
  })
);

router.get("/users/signup", (req, res) => {
  res.render("users/signup");
});

router.post("/users/signup", async (req, res) => {
  const { name, email, password, confirm_password } = req.body;
  const errors = [];
  if (password.length < 8 || password.length == 0) {
    errors.push({ text: "the password must be greater than 8 digits" });
  }
  if (password != confirm_password) {
    errors.push({ text: "the passwords don't match" });
  }
  if (name.length == 0) {
    errors.push({ text: "please type your name" });
  }
  if (email.length == 0) {
    errors.push({ text: "please type your mail" });
  }
  if (errors.length > 0) {
    res.render("users/signup", {
      errors,
      name,
      email,
      password,
      confirm_password,
    });
  } else {
    const emailUser = await User.findOne({ email: email });
    if (emailUser) {
      errors.push({ text: "the email is already in use" });
      res.render("users/signup", {
        errors,
        name,
        email,
        password,
        confirm_password,
      });
    } else {
      const newUSer = new User({ name, email, password });
      newUSer.password = await newUSer.encryptPassword(password);
      await newUSer.save();
      req.flash("success_msg", "You are registered");
      res.redirect("/users/signin");
    }
  }
});

router.get("/users/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
