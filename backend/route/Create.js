const express = require("express")
const router = express.Router()
const {Users, Comments} = require('../model/NodeModel')
const { route } = require("./NodeRoute")
const { genToken } = require('../middleware/validateToken')

router.route('/user/new-user').post((req,res) => {

    const {username, password} = req.body
    
    const newUser = new Users({
        username: username,
        password: password
    })
    
    newUser.save((err,data) => {
        if(!err){
            const token = genToken(username)
            res.json({token: token})
        }
    })
})

router.route('/user/get-users').get((req,res) => {
    res.json("yes")
    // Users.find({}, (err, data) => {
    //     if(!err)
    //         res.json(data)
    // })
})

router.post('/user/store-avatar', (req, res) => {
    const { username, avatar } = req.body
    Users.findOneAndUpdate({username: username}, {$set: {avatar: avatar}}, (err, update) => {
        if(err)
            console.log(err)
        else    
            res.sendStatus(200)
    })
})
module.exports = router;