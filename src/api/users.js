const express = require("express");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const router = express.Router();

var userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  adsId: [String]
});
var User = mongoose.model("User", userSchema);

//Logging in
router.post("/login", async (req, res) => {
  //Search for the user in the db
  mongoose.connect("mongodb://localhost:27017/users", {
    useNewUrlParser: true
  });
  var found = null;
  await User.findOne(
    { username: req.body.username, password: req.body.password },
    (err, res) => {
      assert.equal(err, null);
      if (res !== null) {
        found = res;
        console.log("username and password are correct");
      }
    }
  );
  if (found !== null) {
    //User is in DB
    userPayload = {
      id: found.id,
      username: found.username,
      password: found.password
    };
    jwt.sign(
      { user: userPayload },
      "karem",
      { expiresIn: "30m" },
      (err, token) => {
        assert.equal(null, err);
        userPayload.token = token;
        res.status(200).json(userPayload);
      }
    );
  } else {
    res.status(404).json({ msg: "Forbidden" });
  }
  mongoose.disconnect().then(() => {
    console.log("Disconnected!");
  });
});

//Signing up
router.post("/signUp", async (req, res) => {
  await mongoose.connect("mongodb://localhost:27017/users", {
    useNewUrlParser: true
  });

  var found = false;
  await User.findOne({ username: req.body.username }, (err, res) => {
    if (err) {
      console.log("error searching");
    }
    if (res !== null) {
      // Existant user in DB
      // console.log(res);
      found = true;
    }
  });
  if (found) {
    res.status(200).json({ msg: "Username already taken!" });
    mongoose.disconnect().then(() => {
      console.log("Disconnected!");
    });
  } else {
    const newUser = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      adsId: []
    });

    newUser.save((err, data) => {
      if (err) {
        console.log("Error on saving !");
        console.log(err);
        assert.equal(err, null);
      }
      mongoose.disconnect().then(() => {
        console.log("Disconnected!");
      });
      res.status(200).json({ msg: "User account created successfully!" });
    });
  }
});

module.exports = router;
