const e = require("express");
const express = require("express");
const router = express.Router();
const { Users, Comments } = require("../model/NodeModel");
const { verifyToken } = require("../middleware/validateToken");
///HomePage
// router.use()

router.post("/:username/store/:post_reply", (req, res) => {
  const { Username, Content, commentId, Image } = req.body;
  const { post_reply } = req.params;
  Users.findOne({ username: Username }, (err, save) => {
    if (!err) {
      var avatar = save["avatar"];
      var id = save["_id"];
      const newdata = new Comments({
        type: post_reply === "post" ? "post" : "reply",
        main: post_reply === "reply" ? commentId : "main",
        avatar: avatar,
        username: Username,
        content: Content,
        image: Image,
        createdAt: new Date().toDateString(),
        replies: [],
      });
      newdata
        .save()
        .then((data) => {
          Users.findByIdAndUpdate(
            id,
            { $push: { userContent: data["_id"] } },
            (err, s) => {
              if (!err) {
                if (post_reply === "reply") {
                  Comments.findByIdAndUpdate(
                    commentId,
                    { $push: { replies: data["_id"] } },
                    { new: true },
                    (err, sa) => {
                      if (!err) res.sendStatus(200);
                    }
                  );
                } else res.sendStatus(200);
              }
            }
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

router.post("/:username/like/:id", (req, res) => {
  const id = req.params.id;
  const username = req.params.username;
  Comments.findByIdAndUpdate(id, { $pull: { score: username } })
  
  Comments.findByIdAndUpdate(
    id,
    { $push: { score: username } },
    (err, d) => {
      if (err) {
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

router.post("/:username/dislike/:id", (req, res) => {
  const id = req.params.id;
  const username = req.params.username;
  Comments.findByIdAndUpdate(id, { $pull: { score: username } }, (err, d) => {
    if (err) {
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
    }
  });
});

router.post("/:username/delete/:post_reply", (req, res) => {
  const { id, commentId } = req.body;
  const { username, post_reply } = req.params;
  Comments.findByIdAndDelete(id, (err, data) => {
    if (!err) {
      Users.findOneAndUpdate(
        { username: username },
        { $pull: { userContent: id } },
        (err, save) => {
          if (!err) if (post_reply !== "reply") res.sendStatus(200);
        }
      );
    }
  });
  if (post_reply === "reply") {
    Comments.findOneAndUpdate(
      { _id: commentId },
      { $pull: { replies: id } },
      (err, save) => {
        if (!err) res.sendStatus(200);
      }
    );
  }
});

router.post("/:username/edit", (req, res) => {
  const { id, Content } = req.body;

  Comments.findByIdAndUpdate(id, { $set: { content: Content } }, (err, d) => {
    if (!err) res.json(200);
  });
});

module.exports = router;
