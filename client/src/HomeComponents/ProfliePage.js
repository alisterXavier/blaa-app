import React, { useState } from "react";
import Delete from "../EditDeleteModals/Delete";
import EditContent from "../EditDeleteModals/Edit";
import "../styles/HomePage1.css";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import socket from "../Socket";
import NavBar from "./Navbar";
import Loading from "../Loading/Load";
import { check_content, userName, onDislike, onLike } from "../Functions";
import { validate } from "../token";

function BG(props) {
  const divs = (oarr, int) => {
    let arr = oarr;
    if (arr.length < int) {
      arr.push(<img src={props.avatar} className="profile-bg"></img>);
      divs(arr, int--);
    }
    return arr;
  };

  return (
    <div className="profile-bg-container">
      {divs([], 9).map((d) => {
        return d;
      })}
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const username = state.username;
  const token = {
    authorization: localStorage.getItem("token"),
  };
  const CurrUser = validate(token.authorization);
  const [ActiveContent, setActiveContent] = useState("posts");
  const [validation, setValidation] = useState(
    sessionStorage.getItem("SignedIn")
  );
  const [UserContent, setUserContent] = useState();
  const [UserData, setUserData] = useState();
  const [DeleteModal, setDeleteModal] = useState({ delete: false, id: "" });
  const [Deets, setDeets] = useState({ index: -1, id: "" });
  const [EditModal, setEditModal] = useState({ edit: false, id: "" });
  const [Reply, setReply] = useState({ index: -1, reply: false });

  const DeleteConfirmation = (id, type, cId) => {
    setDeleteModal((DeleteModal) => ({
      delete: true,
      id: id,
      type: type,
      commentId: cId,
    }));
  };

  const clickHandler = (e) => {
    const span = e.target.closest("p > .taggedUser");
    if (span !== null) {
      span.onClick = navigate(`/user/${CurrUser}/profile`, {
        state: { username: span.innerText },
      });
    }
  };

  const sliderOut = (e) => {
    document.getElementById(e.target.lastChild.id).removeAttribute("style");
  };

  const sliderin = (e) => {
    document.getElementById(e.target.lastChild.id).style.left = "0%";
  };

  const Edit = (id) => {
    setEditModal((EditModal) => ({
      edit: true,
      id: id,
    }));
  };

  const bgMove = (e) => {
    const bg = document.getElementsByClassName("profile-bg");
    var valueX = (e.pageX * -1) / 50;
    var valueY = (e.pageY * -1) / 50;
    if (bg !== undefined) {
      for (const x in bg) {
        if (bg.hasOwnProperty(x)) {
          valueX = x % 2 !== 0 ? (e.pageX * -1) / 50 : (e.pageX * 1) / 50;
          valueY = x % 2 !== 0 ? (e.pageY * -1) / 50 : (e.pageY * 1) / 50;
          bg[x].style.transform = `translate3d(${valueX}px,${valueY}px, 0)`;
        }
      }
    }
  };

  const reply = (e) => {
    if (e === Reply.index) setReply({ index: -1, reply: false });
    else setReply({ index: e, reply: true });
  };

  React.useEffect(() => {
    socket.emit("Profile-data", username);
    socket.on("recieve-profile-data", (data) => {
      setUserData(data);
    });
    socket.emit("profile-content", username);
    socket.on("profile-content", (data) => {
      setUserContent(data);
    });
  }, [username]);

  React.useEffect(() => {
    socket.once(
      "Updated",
      (data) => {
        var datas = [];
        data.map((d) => {
          if (d.username === CurrUser) datas.push(d);
        });
        setUserContent(datas);
      },
      []
    );
  });

  return (
    <div className="App" onMouseMove={bgMove}>
      <NavBar></NavBar>
      {UserData !== undefined && UserContent !== undefined ? (
        <>
          <BG CurrUser={CurrUser} avatar={UserData.avatar}></BG>
          <div className="Profile-page">
            {DeleteModal.delete ? (
              <Delete
                DeleteModal={[DeleteModal, setDeleteModal, CurrUser]}
              ></Delete>
            ) : (
              <></>
            )}
            {EditModal.edit ? (
              <EditContent EditModal={[EditModal, setEditModal]}></EditContent>
            ) : (
              <></>
            )}
            <header className="header-content">
              <div className="header-img">
                <img src={UserData.avatar} width="200px"></img>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h1 className="username" style={{ fontSize: "40px" }}>
                  {UserData.username}
                </h1>
              </div>
            </header>
            <main className="main-content">
              <header className="content-nav">
                <ul>
                  {/* <li onMouseLeave={sliderOut} onMouseOver={sliderin} onClick={() => {
                    setActiveContent("about")
                  }}>
                    About
                    <span
                      className="slider"
                      id="slider1"
                    ></span>
                  </li> */}
                  <li
                    onMouseLeave={sliderOut}
                    onMouseOver={sliderin}
                    onClick={() => {
                      setActiveContent("posts");
                    }}
                  >
                    Posts
                    <span className="slider" id="slider2"></span>
                  </li>
                  <li
                    onMouseLeave={sliderOut}
                    onMouseOver={sliderin}
                    onClick={() => {
                      setActiveContent("replies");
                    }}
                  >
                    Replies
                    <span className="slider" id="slider3"></span>
                  </li>
                </ul>
              </header>
              <div className="content">
                <div className="PostReply-container">
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    {UserContent.map((data, index) => {
                      if (ActiveContent === "posts")
                        if (data.type === "post")
                          return (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                width: "90%",
                                position: "relative",
                              }}
                            >
                              <div
                                className="Replies Comments"
                                id={data["_id"]}
                                style={{
                                  width: "100%",
                                }}
                              >
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
                                      onClick={() => {
                                        onDislike(
                                          data["_id"],
                                          data["score"],
                                          { headers: token },
                                          CurrUser
                                        );
                                      }}
                                      viewBox="0 0 24 24"
                                      data-id={data["_id"]}
                                      className="dislike"
                                      xmlns="http://www.w3.org/2000/svg"
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
                                        <img
                                          alt="profile-pic"
                                          src={data["avatar"]}
                                        ></img>
                                      </div>
                                      {userName(data["username"], navigate)}
                                    </div>
                                    <p className="date">{data["createdAt"]}</p>
                                  </div>
                                  <div
                                    className="content-container"
                                    onClick={clickHandler}
                                  >
                                    {
                                      check_content(data["content"]).props
                                        .children
                                    }
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
                                    Deets.index === index &&
                                    Deets.id === data["_id"]
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
                                {CurrUser === data["username"] ? (
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
                                        setDeets({
                                          index: index + 1,
                                          id: data["_id"],
                                        });
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
                                        setDeets({
                                          index: index + 2,
                                          id: data["_id"],
                                        });
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
                                    Deets.index === index + 3 &&
                                    Deets.id === data["_id"]
                                      ? "active"
                                      : ""
                                  }
                                  style={{ backgroundColor: "yellow" }}
                                  onMouseOver={() => {
                                    setDeets({
                                      index: index + 3,
                                      id: data["_id"],
                                    });
                                  }}
                                  onMouseOut={() => {
                                    setDeets(-1);
                                  }}
                                >
                                  Share
                                </li>
                              </ul>
                            </div>
                          );
                      if (ActiveContent === "replies")
                        if (data.type === "reply")
                          return (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                width: "90%",
                                position: "relative",
                              }}
                            >
                              <div
                                className="Replies Comments"
                                id={data["_id"]}
                                style={{ width: "100%" }}
                              >
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
                                      onClick={() => {
                                        onDislike(
                                          data["_id"],
                                          data["score"],
                                          { headers: token },
                                          CurrUser
                                        );
                                      }}
                                      viewBox="0 0 24 24"
                                      data-id={data["_id"]}
                                      className="dislike"
                                      xmlns="http://www.w3.org/2000/svg"
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
                                        <img
                                          alt="profile-pic"
                                          src={data["avatar"]}
                                        ></img>
                                      </div>
                                      <p className="username">
                                        {data["username"]}
                                      </p>
                                    </div>
                                    <p>{data["createdAt"]}</p>
                                  </div>
                                  <div className="content-container">
                                    {check_content(data["content"])}
                                  </div>
                                </div>
                              </div>
                              <ul className="deets">
                                <li
                                  className={
                                    Deets.index === index &&
                                    Deets.id === data["_id"]
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
                                {CurrUser === data["username"] ? (
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
                                        setDeets({
                                          index: index + 1,
                                          id: data["_id"],
                                        });
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
                                        setDeets({
                                          index: index + 2,
                                          id: data["_id"],
                                        });
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
                                    Deets.index === index + 3 &&
                                    Deets.id === data["_id"]
                                      ? "active"
                                      : ""
                                  }
                                  style={{ backgroundColor: "yellow" }}
                                  onMouseOver={() => {
                                    setDeets({
                                      index: index + 3,
                                      id: data["_id"],
                                    });
                                  }}
                                  onMouseOut={() => {
                                    setDeets(-1);
                                  }}
                                >
                                  Share
                                </li>
                              </ul>
                            </div>
                          );
                    })}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </>
      ) : (
        <Loading></Loading>
      )}
    </div>
  );
}

export default Profile;
