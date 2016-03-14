/**
 * users
 *
 * @description :: Server-side logic for managing users.
 * @docs        :: https://github.com/CPSSD/feedlark/blob/master/doc/db/user.md
 */

const bcrypt = require("bcrypt-nodejs");
const userModel = require("../models/user");
const _ = require("lodash");

module.exports = {
  // Login processing
  login: (req, res) => {

    // Load request vars & verify
    var email = req.body.email;
    var password = req.body.password;
    if (!_.isString(email) || !_.isString(password)) return res.status(400).render("login", {err: "Invalid email/password combination."});

    // Get the user's details from the DB
    userModel.findByEmail(email, user => {

      // Is the user name valid? (DB query returns nothing if not)
      if (typeof user == "undefined") return res.status(400).render("login", {err: "Invalid email/password combination."});

        // Check their password
        bcrypt.compare(password, user.password, (err, valid) => {
          if (!valid) return res.status(400).render("login", {err: "Invalid email/password combination."});

          // Set session vars and redirect
          req.session.username = user.username;
          req.session.msg = "Successfully logged in.";
          return res.redirect(302, "/user");
        });
    });
  },

  // Logout processing
  logout: (req, res) => {
    req.session.destroy();
    res.status(200).render("logout");
  },

  // Signup processing
  signup: (req, res) => {

    // Import things & load request vars
    var email = req.body.email;
    var password = req.body.password;
    var username = req.body.username;

    // Verify these details
    if (!_.isString(email) || !_.isString(password) || !_.isString(username)) return res.status(400).render("signup", {err: "Invalid input data."});
    if (email.length < 5) return res.status(400).render("signup", {err: "Email Address too short."});
    if (password.length < 8) return res.status(400).render("signup", {err: "Password too short."});
    if (username.length < 4) return res.status(400).render("signup", {err: "Username too short."});

    // Check the user doesn't already exist
    userModel.exists(username, email, data => {
      if (data) return res.status(400).render("signup", {err: "Email/Username already taken."});

      // Add new user to the database
      userModel.create(username, email, password, _ => {

        // Log the user in
        req.session.username = username;
        req.session.msg = "Signup successful. Welcome!";
        return res.redirect(302, "/user");
      });
    });

  }
};