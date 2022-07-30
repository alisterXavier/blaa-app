const express = require("express");
const app = express();
const router = express.Router();
const { Users, Comments, Group, Direct } = require("../model/NodeModel");
const { verifyToken } = require("../middleware/validateToken");

const send_updated_group = (io, username, usersInvolved) => {
  Group.find(
    {
      name: username,
      usersInvolved: {
        $not: {
          $elemMatch: { username: { $nin: usersInvolved } },
        },
      },
    },
    (err, data1) => {
      usersInvolved.map((u) => {
        io.emit(`${u}-conversations`, data1);
      });
    }
  );
};
router.post("/add/Direct", (req, res) => {
  const { username, type, users } = req.body;

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
                if (!err) res.send(`${type} created!!`).status(200);
                else res.sendStatus(401);
              });
            }
        }
      );
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
        if (!err) res.json(200);
      });
    }
  });
});

router.post("/add/addTo", (req, res) => {
  const { username, gpName, usernames } = req.body;

  Group.findOne(
    {
      name: gpName,
      usersInvolved: {
        $not: { $elemMatch: { username: { $nin: usernames } } },
      },
    },
    (err, save) => {
      if (!err && save !== null && save.usersInvolved.map(u => u.username !== username)) {
        Users.find({ username: username }, (err, data) => {
          if (!err) {
            Group.findOneAndUpdate(
              {
                name: gpName,
              },
              {
                $push: {
                  usersInvolved: { username: username, avatar: data[0].avatar },
                },
                $set:{
                  name: `${gpName}-${username}`
                }
              },
              (err, newSave) => {
                if (!err) res.sendStatus(200);
              }
            );
          }
        });
      }
    }
  );
});

router.post("/send-Direct-text", (req, res) => {
  const { content, image, DisplayConvo, currUser } = req.body;
  var io = req.app.get("io");
  Direct.findOneAndUpdate(
    {
      usersInvolved: {
        $not: { $elemMatch: { username: { $nin: DisplayConvo.username } } },
      },
    },
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
    (err, data) => {
      if (!err) {
        Direct.find(
          {
            usersInvolved: {
              $not: {
                $elemMatch: { username: { $nin: DisplayConvo.username } },
              },
            },
          },
          (err, data1) => {
            DisplayConvo.username.map((u) => {
              io.emit(`${u}-conversations`, data1);
            });
          }
        );
        res.sendStatus(200);
      }
    }
  );
});

router.post("/send-Group-text", (req, res) => {
  const { content, image, DisplayConvo, currUser } = req.body;
  console.log(content, image, DisplayConvo, currUser)
  var io = req.app.get("io");
  Group.findOneAndUpdate(
    {
      name: DisplayConvo.username,
      usersInvolved: {
        $not: {
          $elemMatch: { username: { $nin: DisplayConvo.usersInvolved } },
        },
      },
    },
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
        send_updated_group(
          io,
          DisplayConvo.username,
          DisplayConvo.usersInvolved
        );
        res.sendStatus(200);
      } else console.log(err);
    }
  );
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
  Group.findOneAndUpdate(
    {
      name: DisplayConvo.username,
      usersInvolved: {
        $not: {
          $elemMatch: { username: { $nin: DisplayConvo.usersInvolved } },
        },
      },
    },
    {
      $pull: {
        usersInvolved: { username: currUser },
      },
      $set: {
        name: DisplayConvo.username.replace(`-${currUser}`, "")
      }
    },
    (err, save) => {
      if (!err) {
        send_updated_group(
          io,
          DisplayConvo.username,
          DisplayConvo.usersInvolved
        );
        res.sendStatus(200);
      }
    }
  );
});

router.post("/edit/group-name", (req, res) => {
  const { ToName, DisplayConvo } = req.body;

  var io = req.app.get("io")
  Group.findOneAndUpdate({
    name: DisplayConvo.username,
    usersInvolved: {
      $not: { $elemMatch: { username: { $nin: DisplayConvo.usersInvolved}}}
    },
  },
  {
    $set: {
      name: ToName
    },
  }, (err, data) => {
    if(!err){
      send_updated_group(io, ToName, DisplayConvo.usersInvolved)
      res.sendStatus(200)
    }
  });
});
module.exports = router;
