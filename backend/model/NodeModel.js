const mongoose = require("mongoose");
const { Schema } = mongoose;

let userData = new mongoose.Schema({
  type: { type: String },
  avatar: { type: String },
  main: {type: String},
  username: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  createdAt: { type: String, required: true, default: new Date() },
  score: [{ type: String }],
  replies: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
});

let UsersModel = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  userContent: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  avatar: { type: String },
});

let UserDirectMessages = new mongoose.Schema({
  type: {type: "String", required: true},
  usersInvolved : [{username: { type: "String"}, avatar: { type: "String"}}],
  conversation: [{
    user: {type: "String"},
    text: {type: "String"},
    image: {type: "String"},
    time: {type:"String" }
  }]
})

let UserGroupMessages = new mongoose.Schema({
  name: {type: "String"},
  usersInvolved : [{username: { type: "String"}, avatar: { type: "String"}}],
  conversation: [{
    user: {type: "String"},
    text: {type: "String"},
    image: {type: "String"},
    time: {type:"String" }
  }]
})

const Users = mongoose.model("Users", UsersModel);
const Comments = mongoose.model("Comments", userData);
const Group = mongoose.model("Group", UserGroupMessages)
const Direct = mongoose.model("Direct", UserDirectMessages)

module.exports = { Users, Comments, Group, Direct };
