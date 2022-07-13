require("dotenv").config();
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next){
    const header = req.headers.authorization
    var token 
    token = header
    if(token === null || token == undefined){ 
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.TokenSecretKey,(err, decoded) => {
        if(err){
            return res.status(401).send("Thou shall not enter")
        }
        next()
    })
}

function genToken(username) {
    return jwt.sign({ username: username }, process.env.TokenSecretKey, {
      expiresIn: "5h",
    });
  }

module.exports = {
    verifyToken: verifyToken,
    genToken: genToken
}