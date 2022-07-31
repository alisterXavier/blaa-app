import React, { useState } from "react";
import axios from "axios";
import socket from "../Socket";
import obj from "../token";
import { validate } from "../token";
import { UploadImg } from "../Functions";
import NavBar from "./Navbar";
import Loading from "../Loading/Load";
import { NotificationManager } from "react-notifications";

var CurrUser = validate(localStorage.getItem("token")).username;
var token;
const url = process.env.REACT_APP_baseServerurl + `/user/${CurrUser}/chats`;

export const addDm = async (e, username) => {
  const { id, className } = e.currentTarget;
  const data = {
    username: username,
    type: className,
    name: `${CurrUser}-${username}`,
    users: [CurrUser, username],
  };

  return await axios.post(url + `/add/${id}`, data, { headers: token }).status;
};

function AddToGroup(props) {
  const [allGps, setAllGps] = useState(null);
  React.useEffect(() => {
    socket.emit("chat-groups", CurrUser);
    const receiveConvo = async () => {
      await socket.once("receive-group-chats", (data) => {
        setAllGps(
          data.map((d) => {
            for (const m in d.usersInvolved)
              if (d.usersInvolved[m].username.includes(CurrUser)) return d;
          })
        );
      });
    };
    receiveConvo();
  }, []);
  const add = (e, name, usersInvolved) => {
    const { id, className } = e.currentTarget;
    const data = {
      gpName: name,
      username: props.username,
      usernames: usersInvolved.map((u) => u.username),
    };

    axios.post(url + `/add/${id}`, data, { headers: token }).then((res) => {
      if (res.status) return res.status;
    });
  };
  return (
    <div className="show-all-groups">
      {allGps !== null ? (
        allGps.map((g) => {
          return (
            <div
              id="addTo"
              className="Group"
              style={{
                display: "flex",
                alignItems: "end",
                cursor: "pointer",
                paddingBottom: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                borderBottom: "1px solid white",
                height: "fit-content",
              }}
              onClick={(e) => {
                add(e, g.name, g.usersInvolved);
              }}
            >
              <div style={{ borderRadius: "50px" }}>
                {g.usersInvolved.map((u) => {
                  return (
                    <>
                      <img src={u.avatar} width="20px"></img>
                    </>
                  );
                })}
              </div>
              <p className="username" style={{ margin: "0%" }}>
                {g.name}
              </p>
            </div>
          );
        })
      ) : (
        <Loading></Loading>
      )}
    </div>
  );
}

function Options(props) {
  const handleClick = async (e) => {
    const { id } = e.target;
    const res = await addDm(e, props.username);
    if (res) props.Type(id);
  };
  return (
    <>
      <ul className="add-options">
        <li id="Direct" className="Direct" onClick={handleClick}>
          Direct Message
        </li>
        <li>
          <span
            id="Group"
            className="Group"
            onClick={(e) => {
              document.getElementById("group-options").classList.add("active");
            }}
          >
            Add to group
          </span>
          <ul id="group-options">
            <li
              id="createGroup"
              className="Group"
              onClick={(e) => {
                addDm(e, props.username);
              }}
            >
              Create group
            </li>
            <li
              id="addTo"
              className="Group"
              onClick={() => {
                document
                  .getElementsByClassName("show-all-groups")[0]
                  .classList.add("active");
              }}
            >
              Add to group
            </li>
          </ul>
        </li>
      </ul>
      <AddToGroup username={props.username}></AddToGroup>
    </>
  );
}

function ConversationName(props) {
  const [Toname, setToname] = useState(null);

  const edit_group_name = () => {
    const data = {
      ToName: Toname,
      DisplayConvo: props.DisplayConvo,
    };
    axios.post(url + "/edit/group-name", data, { headers: token });
  };
  return (
    <div id="change-name-container">
      <p
        id="convoName"
        style={{ paddingLeft: "10px", paddingRight: "10px", paddingTop: "5px" }}
      >
        {props.convoName}
      </p>
      <input
        id="change-name"
        value={Toname}
        onChange={(e) => {
          setToname(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            edit_group_name();
            document.getElementById("change-name").classList.remove("active")
            document.getElementById("convoName").innerHTML = Toname
            setToname(null)
          }
        }}
        placeholder={props.convoName}
      ></input>
    </div>
  );
}

function Direct(props) {
  const [Direct, setDirect] = useState(null);

  React.useEffect(() => {
    socket.emit("chat-Direct", CurrUser);
  }, []);

  React.useEffect(() => {
    socket.once("receive-direct-chats", (data) => {
      setDirect(
        data.map((d) => {
          for (const m in d.usersInvolved)
            if (d.usersInvolved[m].username.includes(CurrUser)) return d;
        })
      );
    });
  }, []);

  const Dm = (e) => {
    props.DisplayConvo[1]({
      type: "Direct",
      username: [CurrUser, e.currentTarget.innerText],
    });
    props.convoName(e.currentTarget.innerText);
    props.convo(null);
  };
  return (
    <div className="Direct">
      {Direct !== null ? (
        Direct.map((d) => {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "end",
                cursor: "pointer",
                paddingBottom: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                borderBottom: "1px solid white",
              }}
              onClick={Dm}
            >
              {d.usersInvolved.map((u) => {
                if (u.username !== CurrUser) {
                  return (
                    <>
                      <img src={u.avatar} width="40px"></img>
                      <p className="username" style={{ marginBottom: "0%" }}>
                        {u.username}
                      </p>
                    </>
                  );
                }
              })}
            </div>
          );
        })
      ) : (
        <Loading></Loading>
      )}
    </div>
  );
}

function Group(props) {
  const [Groups, setGroups] = useState(null);

  React.useEffect(() => {
    if (props.RecievedGroups === null) {
      socket.emit("chat-groups", CurrUser);
      const receiveConvo = async () => {
        await socket.once("receive-group-chats", (data) => {
          setGroups(
            data.map((d) => {
              for (const m in d.usersInvolved)
                if (d.usersInvolved[m].username.includes(CurrUser)) return d;
            })
          );
        });
      };
      receiveConvo();
    } else {
      setGroups(
        props.RecievedGroups.map((d) => {
          for (const m in d.usersInvolved)
            if (d.usersInvolved[m].username.includes(CurrUser)) return d;
        })
      );
    }
  }, [props.RecievedGroups]);

  React.useEffect(() => {
    socket.once("receive-group-chats", (data) => {
      setGroups(
        data.map((d) => {
          for (const m in d.usersInvolved)
            if (d.usersInvolved[m].username.includes(CurrUser)) return d;
        })
      );
    });
  });

  const Gm = (e, users) => {
    props.DisplayConvo[1]({
      type: "Group",
      username: e.currentTarget.innerText,
      usersInvolved: users.map((u) => u.username),
    });
    props.convoName(e.currentTarget.innerText);
    props.convo(null);
  };

  return (
    <div className="Group">
      {Groups !== null ? (
        Groups.map((g) => {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "end",
                cursor: "pointer",
                paddingBottom: "10px",
                marginLeft: "10px",
                marginRight: "10px",
                borderBottom: "1px solid white",
              }}
              onClick={(e) => {
                Gm(e, g.usersInvolved);
                console.log(g.usersInvolved);
              }}
            >
              <div
                style={{
                  borderRadius: "10px",
                  width: "50%",
                  height: "100%",
                  display: "flex",
                  overflowX: "scroll",
                  overflowY: "hidden",
                }}
              >
                {g.usersInvolved.map((u) => {
                  return (
                    <>
                      <img src={u.avatar} width="30px"></img>
                    </>
                  );
                })}
              </div>
              <p className="username" style={{ marginBottom: "0%", textOverflow: "ellipsis", width: "70%", overflow:"hidden"}}>
                {g.name}
              </p>
            </div>
          );
        })
      ) : (
        <Loading></Loading>
      )}
    </div>
  );
}

function Search(props) {
  const [Users, setUsers] = useState(null);
  const [displayOptions, setDisplayoptions] = useState(false);
  const [MessageTo, setMessageTo] = useState(null);
  const searchUname = (e) => {
    const { value } = e.target;
    if (value.length > 0) socket.emit("search-users", value);
    socket.once("receive-users", (data) => {
      setUsers(data);
    });
  };
  return (
    <>
      <div className="search-users">
        <input
          type="search"
          placeholder="Search User"
          onChange={searchUname}
        ></input>
      </div>
      {Users !== null ? (
        <div className="users">
          {Users.map((d) => {
            if (d.username !== CurrUser) {
              return (
                <div
                  style={{
                    display: "flex",
                    marginTop: "20px",
                    alignItems: "end",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    setDisplayoptions(true);
                    setMessageTo(e.currentTarget.innerText);
                  }}
                >
                  <img src={d.avatar} width="40px"></img>
                  <p className="username">{d.username}</p>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <></>
      )}
      {displayOptions ? (
        <Options username={MessageTo} Type={props.Type}></Options>
      ) : (
        <></>
      )}
    </>
  );
}

function Conversations(props) {
  const [Convo, setConvo] = useState(null);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const superOrd = (d) => {
    const no = [1, 2, 3, 21, 22, 23, 31];
    switch (d) {
      case 1 || 21 || 31:
        return "st";
      case 2 || 22:
        return "nd";
      case 3 || 23:
        return "rd";
      default:
        return "th";
    }
  };

  const enter_date_or_not = (time, id) => {
    var dates = [];
    const currDate = `${days[new Date(time).getDay()]} ${
      months[new Date(time).getMonth()]
    } ${new Date(time).getDate()}`;
    const convo1 = [...Convo].reverse();
    for (const c in convo1) {
      if (convo1[c]._id === id) {
        break;
      } else {
        dates.push(
          `${days[new Date(convo1[c].time).getDay()]} ${
            months[new Date(convo1[c].time).getMonth()]
          } ${new Date(convo1[c].time).getDate()}`
        );
      }
    }
    if (!dates.includes(currDate)) {
      return false;
    } else return true;
  };

  React.useEffect(() => {
    if (props.allDirectConversations === null) {
      socket.emit(
        `${props.DisplayConvo.type}Conversations`,
        props.DisplayConvo
      );
      socket.once(`receive-conversations`, (convo) => {
        setConvo(convo.reverse());
      });
    } else {
      var data = [];
      props.allDirectConversations.map((c) => {
        if (props.DisplayConvo.type === "Direct")
          for (const x in c) {
            if (c.hasOwnProperty(x) && x === "usersInvolved")
              if (
                c[x]
                  .map(
                    (d) =>
                      props.DisplayConvo.username.includes(d.username) &&
                      props.DisplayConvo.length === d.length
                  )
                  .every((e) => e === true)
              )
                data.push(c.conversation.reverse());
          }
        else if (props.DisplayConvo.type === "Group")
          for (const x in c) {
            if (c.hasOwnProperty(x) && x === "name")
              if (c[x] === props.DisplayConvo.username) {
                data.push(c.conversation.reverse());
              }
          }
      });
      setConvo(data[0]);
    }
  }, [props.allDirectConversations, props.DisplayConvo]);

  return (
    <>
      {Convo !== null && Convo !== undefined ? (
        <>
          {Convo.map((c) => {
            return (
              <div
                className="message-container"
                id={
                  c.user === CurrUser
                    ? "Curruser-messageContainer"
                    : "sender-messageContainer"
                }
                style={{}}
              >
                {enter_date_or_not(c.time, c._id) ? (
                  <></>
                ) : (
                  <p
                    className="convo-time"
                    style={{
                      width: "100%",
                      textAlign: "center",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    }}
                  >
                    {days[new Date(c.time).getDay()]}{" "}
                    {new Date(c.time).getDate()}
                    <span className="super-ordinal">
                      {superOrd(new Date(c.time).getDate())}
                    </span>{" "}
                    {months[new Date(c.time).getMonth()]}
                  </p>
                )}

                <div
                  className={
                    c.user === CurrUser ? "CurrUser-message" : "sender-message"
                  }
                >
                  {c.image ? (
                    <img src={c.image} className="chat-img"></img>
                  ) : (
                    <></>
                  )}
                  <p className="message">{c.text}</p>
                </div>
                <p className="message-username">{c.user}</p>
                <p className="text-time">
                  {new Date(c.time).getHours()}:
                  {(new Date(c.time).getMinutes() > 10 ? "" : "0") +
                    new Date(c.time).getMinutes()}
                </p>
              </div>
            );
          })}
        </>
      ) : (
        <Loading></Loading>
      )}
    </>
  );
}

function Chats() {
  const [type, setType] = useState("Direct");
  const [Deets, setDeets] = useState(false);
  const [groups, setGroups] = useState(null);
  const [DisplayConvo, setDisplayConvo] = useState(null);
  const [Message, setMessage] = useState();
  const [convoName, setConvoName] = useState("");
  const [DirectConvo, setDirectConvo] = useState(null);

  token = {
    authorization: localStorage.getItem("token"),
  };

  CurrUser = validate(localStorage.getItem("token")).username;

  const sendMessage = async (e) => {
    const image = document.getElementById("uploadFile").files[0];
    const imgurl = await UploadImg(image);
    const data = {
      content: Message,
      image: imgurl,
      currUser: CurrUser,
      DisplayConvo,
    };

    await axios
      .post(url + `/send-${DisplayConvo.type}-text`, data, { headers: token })
      .then((res) => {
        socket.emit(`${DisplayConvo.type}Conversations`, DisplayConvo);
        setMessage("");
        document.getElementById("uploadFile").value = "";
        document.getElementById("fileSelected").value = "No file selected";
      })
      .catch((err) => {
        NotificationManager.error("Please resend Message");
      });
  };

  const deleteChat = () => {
    const data = {
      DisplayConvo,
      currUser: CurrUser,
    };
    axios
      .post(url + `/delete/${DisplayConvo.type}`, data, { headers: token })
      .then((res) => {
        NotificationManager.success("Deleted Successfully!");
        setDisplayConvo(null);
        setConvoName("");
        setDeets(false);

      })
      .catch((err) => {
        NotificationManager.error("Delete Unsuccessful");
      });
    setDeets(false);
  };
  React.useEffect(() => {
    socket.once(`${CurrUser}-conversations`, (data) => {
      setDirectConvo(data);
    });
  });

  return (
    <div className="App">
      <NavBar></NavBar>
      <div className="chat-container">
        <div className="contacts">
          <header>
            <div
              onClick={() => {
                setType("Direct");
                setDisplayConvo(null);
                setConvoName("");
                setDirectConvo(null);
                setDeets(false);
              }}
            >
              Direct
            </div>
            <div
              onClick={() => {
                setType("Group");
                setConvoName("");
                setDisplayConvo(null);
                setDirectConvo(null);
                setDeets(false);
              }}
            >
              Groups
            </div>
            <div
              onClick={() => {
                setType("Search");
                setDisplayConvo(null);
                setConvoName("");
                setDirectConvo(null);
              }}
            >
              Search
            </div>
          </header>
          <div className="GoDoS">
            {type === "Direct" ? (
              <Direct
                convoName={setConvoName}
                DisplayConvo={[DisplayConvo, setDisplayConvo]}
                convo={setDirectConvo}
              ></Direct>
            ) : type === "Group" ? (
              <Group
                convoName={setConvoName}
                RecievedGroups={DirectConvo}
                chats={groups}
                DisplayConvo={[DisplayConvo, setDisplayConvo]}
                convo={setDirectConvo}
              ></Group>
            ) : (
              <Search
                Type={setType}
              ></Search>
            )}
          </div>
        </div>
        <div className="conversationsContainer">
          <header className="convoName">
            <div>
              <ConversationName
                convoName={convoName}
                DisplayConvo={DisplayConvo}
              ></ConversationName>
            </div>
            <div className="deets">
              {DisplayConvo !== null ? (
                <>
                  <svg
                    className="deets-logo"
                    onClick={(e) => {
                      setDeets(!Deets);
                    }}
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                  </svg>
                  <div className={Deets ? "options active" : "options"}>
                    {type === "Group" ? (
                      <>
                        <p
                          className={
                            Deets ? "add-members active" : "add-members"
                          }
                          onClick={() => {
                            setType("Search");
                            setDeets(false);
                          }}
                        >
                          Add Members
                        </p>
                        <p
                          className={Deets ? "edit-name active" : "edit-name"}
                          onClick={(e) => {
                            document
                              .getElementById("change-name")
                              .classList.add("active");
                            setDeets(false);
                          }}
                        >
                          Edit group name
                        </p>

                        <p
                          className={Deets ? "exit active" : "exit"}
                          onClick={deleteChat}
                        >
                          Exit Group
                        </p>
                      </>
                    ) : (
                      <p onClick={deleteChat}>Delete</p>
                    )}
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </header>
          <div className="conversations">
            {DisplayConvo !== null ? (
              <>
                <Conversations
                  allDirectConversations={DirectConvo}
                  DisplayConvo={DisplayConvo}
                ></Conversations>
              </>
            ) : (
              <></>
            )}
          </div>
          {DisplayConvo !== null ? (
            <div style={{ position: "relative", height: "15%" }}>
              <label
                className="text-send-container"
                style={{ width: "100%", display: "flex" }}
              >
                <textarea
                  type="text"
                  className="text-bar"
                  placeholder="Enter Message..."
                  value={Message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                />
                <button className="send-btn" onClick={sendMessage}>
                  Send
                </button>
              </label>
              <div className="upload-container">
                <input
                  type="file"
                  id="uploadFile"
                  onChange={(e) => {
                    document.getElementById("fileSelected").textContent =
                      e.target.files[0].name;
                  }}
                  hidden
                />
                <span id="fileSelected">No file selected</span>
                <label for="uploadFile">Upload</label>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chats;
