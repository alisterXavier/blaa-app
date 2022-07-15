const express = require("express")
const router = express.Router()
const {Users, Comments} = require('../model/NodeModel')
const { route } = require("./NodeRoute")
const { genToken } = require('../middleware/validateToken')

router.route('/new-user').post((req,res) => {
    const io = req.app.get("io")

    const {username, password} = req.body
    
    const newUser = new Users({
        username: username,
        password: password
    })
    
    newUser.save((err,data) => {
        if(!err){
            const token = genToken(username)
            Users.find({},(err, data)=> {
                if(!err){
                    var users = []
                    data.map(d => {
                        users.push(d.username)
                    })
                    io.emit('get-users', users)
                }
            })
            res.json({token: token})
        }
        else
            console.log(err)
    })
})

router.post('/:username/store-avatar', (req, res) => {
    const { username, avatar } = req.body
    Users.findOneAndUpdate({username: username}, {$set: {avatar: avatar}}, (err, update) => {
        if(err)
            console.log(err)
        else    
            res.sendStatus(200)
    })
})
module.exports = router;