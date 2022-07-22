import React, { useContext, useState } from "react";
import Delete from "../EditDeleteModals/Delete";
import EditContent from "../EditDeleteModals/Edit";
import NavBar from "../HomeComponents/Navbar";
import "../styles/HomePage1.css";
import '../styles/loading.css'
import '../styles/navbar.css'
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../Socket";
import Loading from "../Loading/Load";
import { validate } from "../token";
import {
  check_content,
  onDislike,
  onLike,
  userName,
} from "../Functions";
var parse = require("html-react-parser");

var token;
var CurrentAvatar;

export const username = React.createContext();

function ReplyCont(props) {
  const [Content, setContent] = useState("");

  const handleChange = (e) => {
    const { value } = e.target;

    setContent(value);
  };

  const handleClick = () => {
    if (Content.length > 0) {
      const data = {
        Username: props.CurrUser,
        Content: Content,
        commentId: props.content_id,
      };

      axios
        .post(
          process.env.REACT_APP_baseServerurl + `/user/:username/store/reply`,
          data,
          { headers: token }
        )
        .then((res) => {
          if (res.status) props.replyState({ reply: false });
        });
    }
  };
  return (
    <div className="Reply-container">
      <div className="Reply" id="reply">
        <div>
          <img src={CurrentAvatar}></img>
        </div>
        <textarea value={Content} onChange={handleChange}></textarea>
        <span className="reply-btn-container">
          <button className="reply-btn" onClick={handleClick}>
            <p>Reply</p>
          </button>
        </span>
      </div>
    </div>
  );
}

function Replies(props) {
  const [seeReplies, setSeeReplies] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
        width: "70%",
      }}
    >
      {props.MainData !== undefined && (props.replies <= 1 || seeReplies) ? (
        props.MainData.map((data, index) => {
          if (data["type"] === "reply" && data["main"] === props.commentId) {
            return (
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  justifyContent: "right",
                  width: "90%",
                  borderLeft: "var(--dark-border)",
                }}
              >
                <div className="Replies Comments" id={data["_id"]}>
                  <div className="Likes">
                    <div className="like">
                      <svg
                        viewBox="0 0 32 32"
                        data-id={data["_id"]}
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => {
                          onLike(data["_id"], props.MainData, { headers: token });
                        }}
                      >
                        <path
                          data-id={data["_id"]}
                          d="M28,14H18V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v10H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h10v10c0,1.104,0.896,2,2,2  s2-0.896,2-2V18h10c1.104,0,2-0.896,2-2S29.104,14,28,14z"
                        />
                      </svg>
                    </div>
                    <p id="score">{data["score"].length}</p>
                    <div className="dislike">
                      <svg
                        viewBox="0 0 24 24"
                        data-id={data["_id"]}
                        className="dislike"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => {
                          onDislike(data["_id"], props.MainData, { headers: token });
                        }}
                      >
                        <path
                          data-id={data["_id"]}
                          d="M18,11H6c-1.104,0-2,0.896-2,2s0.896,2,2,2h12c1.104,0,2-0.896,2-2S19.104,11,18,11z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="Comment-Header">
                    <div className="Comment-info">
                      <div className="inner-header">
                        <div>
                          <img alt="profile-pic" src={data["avatar"]}></img>
                        </div>
                        <p className="username">{data["username"]}</p>
                      </div>
                      <p>{data["createdAt"]}</p>
                    </div>
                    <div className="content-container" onClick={props.clickHandler}>
                      {check_content(data["content"])}
                    </div>
                  </div>
                </div>
                <ul className="deets">
                  <li
                    className={
                      props.Deets[0].index === index &&
                      props.Deets[0].id === data["_id"]
                        ? "active"
                        : ""
                    }
                    style={{ backgroundColor: "lightblue" }}
                    onClick={() => {
                      props.reply(index);
                    }}
                    onMouseOver={() => {
                      props.Deets[1]({ index: index, id: data["_id"] });
                    }}
                    onMouseOut={() => {
                      props.Deets[1](-1);
                    }}
                  >
                    Reply
                  </li>
                  {props.validation && props.CurrUser === data["username"] ? (
                    <>
                      <li
                        className={
                          props.Deets[0].index === index + 1 &&
                          props.Deets[0].id === data["_id"]
                            ? "active"
                            : ""
                        }
                        style={{ backgroundColor: "limegreen" }}
                        onClick={() => {
                          props.Edit(data["_id"]);
                        }}
                        onMouseOver={() => {
                          props.Deets[1]({
                            index: index + 1,
                            id: data["_id"],
                          });
                        }}
                        onMouseOut={() => {
                          props.Deets[1](-1);
                        }}
                      >
                        Edit
                      </li>
                      <li
                        className={
                          props.Deets[0].index === index + 2 &&
                          props.Deets[0].id === data["_id"]
                            ? "active"
                            : ""
                        }
                        style={{ backgroundColor: "#FF928E" }}
                        onClick={() => {
                          props.DeleteConfirmation(
                            data["_id"],
                            "reply",
                            props.commentId
                          );
                        }}
                        onMouseOver={() => {
                          props.Deets[1]({
                            index: index + 2,
                            id: data["_id"],
                          });
                        }}
                        onMouseOut={() => {
                          props.Deets[1](-1);
                        }}
                      >
                        Delete
                      </li>
                    </>
                  ) : (
                    <></>
                  )}
                  <li
                    className={
                      props.Deets[0].index === index + 3 &&
                      props.Deets[0].id === data["_id"]
                        ? "active"
                        : ""
                    }
                    style={{ backgroundColor: "yellow" }}
                    onMouseOver={() => {
                      props.Deets[1]({ index: index + 3, id: data["_id"] });
                    }}
                    onMouseOut={() => {
                      props.Deets[1](-1);
                    }}
                  >
                    Share
                  </li>
                </ul>
              </div>
            );
          }
        })
      ) : !seeReplies && props.replies > 1 ? (
        <div className="more-replies-container">
          <div className="more-replies">
            <p
              onClick={() => {
                setSeeReplies(true);
              }}
            >
              Click here to see more replies
            </p>
          </div>
        </div>
      ) : (
        <></>
      )}
      {seeReplies && props.replies > 1 ? (
        <div className="more-replies-container">
          <div className="less-replies">
            <p
              onClick={() => {
                setSeeReplies(false);
              }}
            >
              Click here to see less replies
            </p>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

function Content(props) {
  const navigate = useNavigate();
  const [MainDisplay, setMainDisplay] = useState();
  const [DeleteModal, setDeleteModal] = useState({ delete: false, id: "" });
  const [Deets, setDeets] = useState({ index: -1, id: "" });
  const [EditModal, setEditModal] = useState({ edit: false, id: "" });
  const [Reply, setReply] = useState({ index: -1, reply: false });
  const CurrUser = useContext(username);

  const DeleteConfirmation = (id, type, cId) => {
    setDeleteModal((DeleteModal) => ({
      delete: true,
      id: id,
      type: type,
      commentId: cId,
    }));
  };

  const Edit = (id) => {
    setEditModal((EditModal) => ({
      edit: true,
      id: id,
    }));
  };

  const reply = (e) => {
    if (e === Reply.index) setReply({ index: -1, reply: false });
    else setReply({ index: e, reply: true });
  };

  const clickHandler = (e) => {
    const span = e.target.closest("p > .taggedUser");
    if (span !== null) {
      span.onClick = navigate(`/user/${CurrUser}/profile`, {
        state: { username: span.innerText },
      });
    }
  };

  const newUpdate = async () =>{
      const newU = document.getElementsByClassName("PostReply-container")[0].children[0]
      newU.classList.add("new")
      // setTimeout(() => {
      //   newU.classList.remove("new")
      // }, 4000)
  }

  React.useEffect(() => {
    if(props.MainData !== undefined && MainDisplay !== undefined)
      if(props.MainData.length > MainDisplay.length){      
        newUpdate()
      }
    setMainDisplay(props.MainData);
  }, [props.MainData]);

  return (
    <div className="PostReply-container">
      {DeleteModal.delete ? (
        <Delete DeleteModal={[DeleteModal, setDeleteModal, CurrUser]}></Delete>
      ) : (
        <></>
      )}
      {EditModal.edit ? (
        <EditContent EditModal={[EditModal, setEditModal]}></EditContent>
      ) : (
        <></>
      )}
      {MainDisplay !== undefined ? (
        MainDisplay.map((data, index) => {
          if (data["type"] === "post") {
            return (
              <>
                <div
                  style={{
                    width: "90%",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: "70%",
                      position: "relative",
                    }}
                  >
                    <div className="Comments" id={data["_id"]}>
                      <div className="Likes">
                        <div className="like">
                          <svg
                            viewBox="0 0 32 32"
                            data-id={data["_id"]}
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={() => {
                              onLike(
                                data["_id"],
                                data["score"],
                                { headers: token },
                                CurrUser
                              );
                            }}
                          >
                            <path
                              data-id={data["_id"]}
                              d="M28,14H18V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v10H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h10v10c0,1.104,0.896,2,2,2  s2-0.896,2-2V18h10c1.104,0,2-0.896,2-2S29.104,14,28,14z"
                            />
                          </svg>
                        </div>
                        <p id="score">{data["score"].length}</p>
                        <div className="dislike">
                          <svg
                            viewBox="0 0 24 24"
                            data-id={data["_id"]}
                            className="dislike"
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={() => {
                              onDislike(data["_id"], data["score"], {
                                headers: token,
                              }, CurrUser);
                            }}
                          >
                            <path
                              data-id={data["_id"]}
                              d="M18,11H6c-1.104,0-2,0.896-2,2s0.896,2,2,2h12c1.104,0,2-0.896,2-2S19.104,11,18,11z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="Comment-Header">
                        <div className="Comment-info">
                          <div className="inner-header">
                            <div>
                              <img alt="profile-pic" src={data["avatar"]}></img>
                            </div>
                            {userName(data["username"], navigate)}
                          </div>
                          <p className="date">{data["createdAt"]}</p>
                        </div>
                        <div
                          className="content-container"
                          onClick={clickHandler}
                        >
                          {check_content(data["content"]).props.children}
                          <img
                            src={data["image"]}
                            className="image-content"
                          ></img>
                        </div>
                      </div>
                    </div>
                    <ul className="deets">
                      <li
                        className={
                          Deets.index === index && Deets.id === data["_id"]
                            ? "active"
                            : ""
                        }
                        style={{ backgroundColor: "lightblue" }}
                        onClick={() => {
                          reply(index);
                        }}
                        onMouseOver={() => {
                          setDeets({ index: index, id: data["_id"] });
                        }}
                        onMouseOut={() => {
                          setDeets(-1);
                        }}
                      >
                        Reply
                      </li>
                      {props.validation && CurrUser === data["username"] ? (
                        <>
                          <li
                            className={
                              Deets.index === index + 1 &&
                              Deets.id === data["_id"]
                                ? "active"
                                : ""
                            }
                            style={{ backgroundColor: "limegreen" }}
                            onClick={() => {
                              Edit(data["_id"]);
                            }}
                            onMouseOver={() => {
                              setDeets({ index: index + 1, id: data["_id"] });
                            }}
                            onMouseOut={() => {
                              setDeets(-1);
                            }}
                          >
                            Edit
                          </li>
                          <li
                            className={
                              Deets.index === index + 2 &&
                              Deets.id === data["_id"]
                                ? "active"
                                : ""
                            }
                            style={{ backgroundColor: "#FF928E" }}
                            onClick={() => {
                              DeleteConfirmation(data["_id"], "post");
                            }}
                            onMouseOver={() => {
                              setDeets({ index: index + 2, id: data["_id"] });
                            }}
                            onMouseOut={() => {
                              setDeets(-1);
                            }}
                          >
                            Delete
                          </li>
                        </>
                      ) : (
                        <></>
                      )}
                      <li
                        className={
                          Deets.index === index + 3 && Deets.id === data["_id"]
                            ? "active"
                            : ""
                        }
                        style={{ backgroundColor: "yellow" }}
                        onMouseOver={() => {
                          setDeets({ index: index + 3, id: data["_id"] });
                        }}
                        onMouseOut={() => {
                          setDeets(-1);
                        }}
                      >
                        Share
                      </li>
                    </ul>
                  </div>
                  {Reply.reply && Reply.index === index ? (
                    <ReplyCont
                      content_id={data["_id"]}
                      replyState={setReply}
                      CurrUser={CurrUser}
                    ></ReplyCont>
                  ) : (
                    <></>
                  )}
                  <Replies
                    replies={data["replies"].length}
                    validation={props.validation}
                    Deets={[Deets, setDeets]}
                    DeleteConfirmation={DeleteConfirmation}
                    CurrUser={CurrUser}
                    reply={reply}
                    Edit={Edit}
                    MainData={MainDisplay}
                    commentId={data["_id"]}
                    clickHandler={clickHandler}
                  ></Replies>
                </div>
              </>
            );
          }
        })
      ) : (
        <Loading></Loading>
      )}
    </div>
  );
}

function Home() {
  const { state } = useLocation();
  const [validation, setValidation] = useState(
    JSON.parse(sessionStorage.getItem("SignedIn"))
  );
  const [MainData, setMainData] = useState();
  var CurrUser;
  if (validation) {
    CurrUser = validate(localStorage.getItem("token"));
    token = {
      authorization: localStorage.getItem("token"),
    };
  }

  React.useEffect(() => {
    socket.emit("content");
  }, []);
  
  React.useEffect(() => {
    if (localStorage.getItem("token") === null) setValidation(false);
    
    socket.once("get-data", (data) => {
      setMainData(data);
    });

    socket.once("Updated", (data) => {
      setMainData(data)
      
    });
  });

  return (
    <div className="App">
      <username.Provider value={CurrUser}>
        <div>
          <NavBar MainData={MainData} socket={socket} />
        </div>
        {MainData === undefined ? (
          <Loading></Loading>
        ) : (
          <Content MainData={MainData} validation={validation}></Content>
        )}
      </username.Provider>
    </div>
  );
}

export default Home;
