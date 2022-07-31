require("dotenv").config();
const express = require("express");
const router = express.Router();
const { Users } = require("../model/NodeModel");
const { route } = require("./NodeRoute");
const jwt = require("jsonwebtoken");
const { verify } = require("crypto");
const { verifyToken, genToken } = require("../middleware/validateToken");

router.route("/login").post((req, res) => {
  const { Username, Password } = req.body;
  const auth = req.headers.authorization;
  let token;
  if (auth != null || auth != undefined) {
    token = auth || auth.split(" ")[1];
    jwt.verify(token, process.env.TokenSecretKey, (err, decoded) => {
      if (err) {
        return res.status(401).send("Thou shall not enter");
      }
      res.json({ login: true, token: `${token}`, username: decoded.username });
    });
  } else
    Users.find({ username: Username }, (err, data) => {
      if (!err) {
        if (data.length > 0) {
          if (data[0].password === Password) {
            token = genToken(Username);
            res.json({ login: true, token: token, username: Username });
          } else {
            res.status(401).send({ login: false });
          }
        } else res.status(401).send({ login: false });
      }
    });
});

module.exports = router;
