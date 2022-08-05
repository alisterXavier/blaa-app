const express = require("express");
const app = express();
const router = express.Router();
const { Users, Comments, Group, Direct } = require("../model/NodeModel");
const { verifyToken } = require("../middleware/validateToken");

const send_updated_group = (io, id, usersInvolved) => {
  usersInvolved.map( u => {
    Group.find({usersInvolved: {$elemMatch: {usersname: u}}}, (err, save) => {
      if(!err){
        let chats = save.map(s => {return { id: s._id, users: s.usersInvolved, name: s.name} })
        io.emit(`${u}-receive-groups`, chats)
      }
    })
  })
};

router.post("/add/Direct", (req, res) => {
  const { username, type, users } = req.body;
  const io = req.app.get("io")
  Users.find({ username: users }, (err, data) => {
    if (!err) {
      var allUsers = [];
      var chat;
      data.map((d) => {
        allUsers.push({ username: d.username, avatar: d.avatar });
      });
      Direct.find(
        {
          usersInvolved: {
            $not: { $elemMatch: { username: { $nin: users } } },
          },
        },
        (err, save) => {
          if (!err)
            if (save.length > 0) return res.sendStatus(200);
            else {
              chat = new Direct({
                type: type,
                username: username,
                usersInvolved: allUsers,
              });
              chat.save((err, save) => {
                if (err) {
                  res.sendStatus(401);
                }
              });
            }
          }
          );
        Direct.find({
          usersInvolved: {
            $not: { $elemMatch: { username: { $nin: users } } },
          },
        },(err, save) => {
          if(!err){
            let chats = save.map(s => {return s._id, s.usersInvolved})
            users.map(u => {
              io.emit(`${u}-direct-chats`, chats)
            })
            res.send(`${type} created!!`).status(200)
          }
        })
    }
  });
});

router.post("/add/createGroup", (req, res) => {
  const { username, users, name } = req.body;
  var allUsers = [];

  Users.find({ username: users }, (err, data) => {
    if (!err) {
      data.map((d) => {
        allUsers.push({ username: d.username, avatar: d.avatar });
      });
      const group = new Group({
        name: name,
        username: username,
        usersInvolved: allUsers,
      });
      group.save((err, save) => {
        if (!err) {
          res.json(200);
        }
      });
    }
  });
});

router.post("/add/addTo", (req, res) => {
  const { username, gpName, id } = req.body;
  const io = req.app.get("io");
  Group.findById(id, (err, save) => {
    if (
      !err &&
      save !== null &&
      save.usersInvolved.map((u) => u.username !== username)
    ) {
      Users.find({ username: username }, (err, data) => {
        if (!err) {
          Group.findByIdAndUpdate(
            id,
            {
              $push: {
                usersInvolved: { username: username, avatar: data[0].avatar },
              },
              $set: {
                name: `${gpName}-${username}`,
              },
            },
            (err, newSave) => {
              if (!err) {
                Group.findById(id, (err, save) => {
                  if(!err){
                    let chats = {id: save._id, users: save.usersInvolved, name: save.name}
                    io.emit(`${username}-receive-groups`, chats)
                  }
                })
                res.sendStatus(200)
              }
            }
          );
        }
      });
    }
  });
});

router.post("/send-Direct-text/:id", (req, res) => {
  const { content, image, currUser } = req.body;
  const { id } = req.params;
  var io = req.app.get("io");
  Direct.findByIdAndUpdate(
    id,
    {
      $push: {
        conversation: [
          {
            user: currUser,
            text: content,
            image: image,
            time: `${new Date()}`,
          },
        ],
      },
    },
    (err, save) => {
      if (!err) {
        Direct.findById(id, (err, save1) => {
          if (!err)
            io.emit(`${id}-conversations`, save1.conversation.reverse());
        });
        res.sendStatus(200);
      }
    }
  );
});

router.post("/send-Group-text/:id", (req, res) => {
  const { content, image, currUser } = req.body;
  const { id } = req.params;
  var io = req.app.get("io");
  Group.findById(id, (err, save) => {
    if (!err) {
      if (!save.usersInvolved.includes(currUser)) {
        res.sendStatus(401);
      }
    }
  });

  Group.findByIdAndUpdate(
    id,
    {
      $push: {
        conversation: [
          {
            user: currUser,
            text: content,
            image: image,
            time: `${new Date()}`,
          },
        ],
      },
    },
    (err, save) => {
      if (!err) {
        Group.findById(id, (err, save1) => {
          if (!err) {
            io.emit(`${id}-conversations`, save1.conversation.reverse());
          }
        });
        res.sendStatus(200);
      }
    }
  );
});

router.get("/get-convo/:type/:id", (req, res) => {
  const { id, type } = req.params;
  if (type === "Group")
    Group.findById(id, (err, save) => {
      if (!err) {
        res.json(save.conversation.reverse());
      }
    });
  else {
    Direct.findById(id, (err, save) => {
      if (!err) {
        res.json(save.conversation.reverse());
      }
    });
  }
});

router.post("/delete/Direct", (req, res) => {
  const { DisplayConvo } = req.body;

  Direct.findOneAndDelete(
    {
      usersInvolved: {
        $not: { $elemMatch: { username: { $nin: DisplayConvo.username } } },
      },
    },
    (err, data) => {
      if (!err) res.sendStatus(200);
    }
  );
});

router.post("/delete/Group", (req, res) => {
  const { DisplayConvo, currUser } = req.body;
  var io = req.app.get("io");
  Group.findByIdAndUpdate(
    DisplayConvo.id,
    {
      $pull: {
        usersInvolved: { username: currUser },
      },
      $set: {
        name: DisplayConvo.username.replace(`-${currUser}`, ""),
      },
    },
    (err, save) => {
      if (!err) {
        send_updated_group(io, DisplayConvo.id, save.usersInvolved);
        res.sendStatus(200);
      }
    }
  );
});

router.post("/edit/group-name", (req, res) => {
  const { ToName, DisplayConvo } = req.body;

  var io = req.app.get("io");
  Group.findByIdAndUpdate(
    DisplayConvo.id,
    {
      $set: {
        name: ToName,
      },
    },
    (err, data) => {
      if (!err) {
        send_updated_group(io, DisplayConvo.id, DisplayConvo.usersInvolved);
        res.sendStatus(200);
      }
    }
  );
});
module.exports = router;
