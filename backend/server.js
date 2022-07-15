require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const router = express.Router();
const mongoose = require("mongoose");
const mongo = require("mongodb");
const { verifyToken } = require("./middleware/validateToken");
const path = require('path')
const __dirname1 = path.resolve()
const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log("Socket listening " + PORT);
});

const io =  require("socket.io")(server, {
    cors: {
      origin: "*",
      credential: true,
    },
  });
app.use(
  cors({
    credentials: true,
  })
);

app.use(express.json());

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname1, '/client/build')))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname1, 'client', 'build', 'index.html'))
  })
}else{
  app.get('/', (req, res) => {
    res.send("App is running")
  })
}
const {
  Users,
  Comments,
  Group,
  Direct,
} = require("./model/NodeModel");

app.set("io", io)

app.use("/", require("./route/LoginRoute"))

app.use("/create", require("./route/Create"));

app.use("/user", verifyToken, require("./route/NodeRoute"));

app.use("/user/:user/chats", verifyToken, require("./route/ChatRoute"));



mongoose
  .connect(process.env.MongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

io.on("connection", (socket) => {
  var content_id = null;
  const ContentStream = Comments.watch();
  ContentStream.on("change", (next) => {
    Comments.find({}, (err, save) => {
      if (!err) {
        socket.emit("Updated", save.reverse());
      }
    });
  }).on("error", (err) => {
    console.log(err);
  });

  socket.on("get-users", () => {
    Users.find({}, (err, data) => {
      if(!err){
        var users = []
        if(data != undefined)
          data.map(d => {
            users.push(d.username)
          })
        socket.emit("get-users", users)
      }
    })
  })
  socket.on("content", (username) => {
    var recievedData;
    content_id = null;
    Comments.find({}, function (err, data) {
      if (!err) {
        recievedData = data;
        socket.emit("get-data", recievedData.reverse());
      }
    });
  });

  //---------
  socket.on("profile-content", (username) => {
    Users.find({ username: username }, (err, data) => {
      if (!err) {
        content_id = data[0]["userContent"];
        Comments.find({ _id: { $in: content_id } }, (err, content) => {
          socket.emit("profile-content", content.reverse());
        });
      }
    });
  });

  socket.on("Profile-data", (username) => {
    Users.find({ username: username }, (err, save) => {
      if (!err && save.length > 0) {
        socket.emit("recieve-profile-data", {
          username: save[0]["username"],
          avatar: save[0]["avatar"],
        });
      }
    });
  });

  socket.on("Nav-data", (username) => {
    Users.find({ username: username }, (err, save) => {
      if (!err && save.length > 0) {
        socket.emit("recieve-Nav-data", {
          username: save[0]["username"],
          avatar: save[0]["avatar"],
        });
      }
    });
  });

  //---------
  socket.on("searchData", (searchData) => {
    var Data = { users: [], comments: [] };
    content_id = searchData;

    Users.find(
      { username: { $regex: searchData, $options: "i" } },
      (err, s) => {
        if (!err) {
          for (const x in s) {
            Data.users.push({
              username: s[x]["username"],
              avatar: s[x]["avatar"],
            });
          }
          Comments.find(
            {
              $or: [
                { content: { $regex: searchData, $options: "i" } },
                { username: { $regex: searchData, $options: "i" } },
              ],
            },
            (err, data) => {
              if (!err) {
                for (const x in data.reverse()) {
                  Data.comments.push(data[x]);
                }
                socket.emit("searchData", Data);
              }
            }
          );
        }
      }
    );
  });

  socket.on("chat-Direct", (user) => {
    Direct.find(
      { usersInvolved: { $elemMatch: { username: user } } },
      (err, save) => {
        if (!err) {
          socket.emit("receive-direct-chats", save);
        }
      }
    );
  });

  socket.on("chat-groups", (user) => {
    Group.find(
      { usersInvolved: { $elemMatch: { username: user } } },
      (err, data) => {
        if (!err) socket.emit("receive-group-chats", data);
      }
    );
  });

  socket.on("search-users", (data) => {
    Users.find({ username: { $regex: data, $options: "i" } }, (err, save) => {
      if (!err) {
        let data = [];
        save.map((s) => {
          data.push({ username: s.username, avatar: s.avatar });
        });
        socket.emit("receive-users", data);
      }
    });
  });

  socket.on("DirectConversations", (data) => {
    Direct.find(
      {
        usersInvolved: {
          $not: { $elemMatch: { username: { $nin: data.username } } },
        },
      },
      (err, save) => {
        if (!err) {
          socket.emit("receive-conversations", save[0].conversation);
        }
      }
    );
  });

  socket.on("GroupConversations", (data) => {
    Group.find(
      {
        name: data.username
      },
      (err, save) => {
        if (!err) {
          socket.emit("receive-conversations", save[0].conversation);
        }
      }
    );
  });
});


