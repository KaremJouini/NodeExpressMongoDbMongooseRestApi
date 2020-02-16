const express = require("express");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

const MongoClient = require("mongodb").MongoClient;

const mongodb = require("mongodb");

//Connection URL
const url = "mongodb://localhost:27017";

//Database and collection creation
//Important: In MongoDB, a collection is not created until it gets content!
//Important: In MongoDB, a database is not created until it gets content!
//MongoDB waits until you have inserted a document before it actually creates the collection.

MongoClient.connect(url, (err, db) => {
  assert.equal(null, err);
  var dbo = db.db("ads");
  dbo.createCollection("ads", (err, res) => {
    assert.equal(null, err);
    //console.log(" ADS Collection created!");
    db.close();
  });
});

// Router Endpoints
//Get all ads
router.get("/", async (req, res) => {
  MongoClient.connect(url, (err, db) => {
    assert.equal(null, err);
    var dbo = db.db("ads");
    dbo
      .collection("ads")
      .find({})
      .toArray((err, result) => {
        res.status(200).send(result);
        assert.equal(err, null);
      });
    db.close();
  });
});

// Get ad by id
router.get("/:id", verifytoken, (req, res) => {
  jwt.verify(req.token, "karem", (err, authData) => {
    if (err) {
      //invalid token
      res.sendStatus(403);
    } else {
      MongoClient.connect(url, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db("ads");
        dbo
          .collection("ads")
          .find({ _id: ObjectId(req.params.id) })
          .toArray((err, result) => {
            res.status(200).send(result);
            assert.equal(err, null);
          });
        db.close();
      });
    }
  });
});

// Create an ad
router.post("/", verifytoken, (req, res) => {
  //Verifying the validity of the token
  jwt.verify(req.token, "karem", (err, authData) => {
    if (err) {
      //invalid token
      res.sendStatus(403);
    } else {
      //Posting the new ad

      const newAd = { title: req.body };
      MongoClient.connect(url, (err, db) => {
        assert.equal(null, err);
        var dbo = db.db("ads");
        dbo.collection("ads").insertOne(newAd, (err, res) => {
          assert.equal(null, err);
        });
        db.close();
      });
      res.status(200).send("1 Document inserted");
    }
  });
});

// Delete an ad
router.delete("/:id", verifytoken, (req, res) => {
  jwt.verify(req.token, "karem", (err, authData) => {
    if (err) {
      //invalid token
      res.sendStatus(403);
    } else {
      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log(req.params.id);
        var dbo = db.db("ads");
        dbo
          .collection("ads")
          .deleteOne({ _id: mongodb.ObjectId(req.params.id) }, (err, obj) => {
            if (!err) {
              res.status(200).json({ msg: "1 Document Deleted" });
            } else {
              res.status(500).json({ msg: "Errror in deletion" });
            }
            db.close();
          });
      });
    }
  });
});

// Update an ad
router.put("/:id", verifytoken, (req, res) => {
  jwt.verify(req.token, "karem", (err, authData) => {
    if (err) {
      //invalid token
      res.sendStatus(403);
    } else {
      MongoClient.connect(url, (err, db) => {
        assert.equal(err, null);
        var dbo = db.db("ads");
        var newvalues = { $set: { title: req.body.title } };
        dbo
          .collection("ads")
          .updateOne(
            { _id: mongodb.ObjectId(req.params.id) },
            newvalues,
            (err, response) => {
              if (!err) {
                res.status(200).json({ msg: "1 Document deleted" });
              } else {
                res.status(500).json({ msg: "Error deleting" });
              }
              db.close();
            }
          );
      });
    }
  });
});

//A middleware function to check whether the token is included in the request or not
function verifytoken(req, res, next) {
  //GetAuthHeaderValue format Authorization : Bearer <access_token>
  const bearerHeader = req.headers["authorization"]; //Actual token
  if (typeof bearerHeader !== "undefined") {
    //extracting the token
    const bearer = bearerHeader.split(" ");
    // Get token
    const bearerToken = bearer[1];
    //Set the token into the request
    req.token = bearerToken;
  } else {
    res.sendStatus(403);
  }
  next();
}

module.exports = router;
