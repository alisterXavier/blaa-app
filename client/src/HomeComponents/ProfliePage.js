import React, { useContext, useState } from "react";
import Delete from "../EditDeleteModals/Delete";
import EditContent from "../EditDeleteModals/Edit";
import ReplyContainer from "../EditDeleteModals/Reply";
import "./styles/Profile.css";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../Socket";
import NavBar from "./Navbar";
import { Loading } from "../Loading/Load";
import { check_content, userName, onDislike, onLike } from "../Functions";
import { validate } from "../token";
import { Screen } from "../Routes";

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
  const CurrUser = validate(token.authorization).username;
  const [ActiveContent, setActiveContent] = useState("posts");
  const [validation, setValidation] = useState(
    validate(localStorage.getItem("token")).login
  );
  const [Deets, setDeets] = useState({ index: -1, id: "" });
  const [MobileDeets, setMobileDeets] = useState({ deetsId: -1, deets: false });
  const [UserContent, setUserContent] = useState();
  const [UserData, setUserData] = useState();
  const [DeleteModal, setDeleteModal] = useState({ delete: false, id: "" });
  const [EditModal, setEditModal] = useState({ edit: false, id: "" });
  const [Reply, setReply] = useState({ id: 0, reply: false });
  const screen = useContext(Screen);

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
    if (e === Reply.index) setReply({ id: -1, reply: false });
    else setReply({ id: e, reply: true });
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
            {DeleteModal.delete && (
              <Delete
                DeleteModal={[DeleteModal, setDeleteModal, CurrUser]}
              ></Delete>
            )}
            {EditModal.edit && (
              <EditContent Edit={[EditModal, setEditModal]}></EditContent>
            )}
            {Reply.reply && (
              <ReplyContainer reply={[Reply, setReply]}></ReplyContainer>
            )}
            <header className="header-content">
              <div className="header-img">
                <img src={UserData.avatar} width="200px"></img>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h1 className="username">{UserData.username}</h1>
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
              <div className="PostReply-container">
                <div className="Post-Reply-wrapper">
                  {UserContent.map((data, index) => {
                    if (ActiveContent === "posts")
                      if (data.type === "post")
                        return (
                          <div className="PostReply-main">
                            <div className="Replies Comments" id={data["_id"]}>
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
                                      onDislike(
                                        data["_id"],
                                        data["score"],
                                        {
                                          headers: token,
                                        },
                                        CurrUser
                                      );
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
                                      <img
                                        alt="profile-pic"
                                        src={data["avatar"]}
                                      ></img>
                                    </div>
                                    {userName(data["username"], navigate)}
                                  </div>
                                  <p className="date">{data["createdAt"]}</p>
                                  {screen < 500 && (
                                    <div className="deets-m">
                                      <span>
                                        <svg
                                          onClick={() => {
                                            setMobileDeets({
                                              deetsId: index,
                                              deets: !MobileDeets.deets,
                                            });
                                          }}
                                          className="deets-img"
                                          data-name="Layer 1"
                                          id="Layer_1"
                                          viewBox="0 0 200 200"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path d="M114.17,56.87A14.17,14.17,0,1,1,100,42.7,14.18,14.18,0,0,1,114.17,56.87Zm-24.74,0A10.57,10.57,0,1,0,100,46.3,10.58,10.58,0,0,0,89.43,56.87Z" />
                                          <path d="M114.17,100A14.17,14.17,0,1,1,100,85.83,14.19,14.19,0,0,1,114.17,100Zm-24.74,0A10.57,10.57,0,1,0,100,89.43,10.58,10.58,0,0,0,89.43,100Z" />
                                          <path d="M114.17,143.13A14.17,14.17,0,1,1,100,129,14.19,14.19,0,0,1,114.17,143.13Zm-24.74,0A10.57,10.57,0,1,0,100,132.57,10.58,10.58,0,0,0,89.43,143.13Z" />
                                        </svg>
                                      </span>
                                      <ul
                                        className={
                                          MobileDeets.deetsId === index &&
                                          MobileDeets.deets
                                            ? "deets-opt active"
                                            : "deets-opt"
                                        }
                                      >
                                        {validation && (
                                          <>
                                            <li
                                              onClick={() => {
                                                setMobileDeets({});
                                                reply(data["_id"]);
                                              }}
                                            >
                                              Reply
                                            </li>
                                            {CurrUser === data["username"] && (
                                              <>
                                                <li
                                                  onClick={() => {
                                                    setMobileDeets({});
                                                    setEditModal({
                                                      edit: true,
                                                      id: index,
                                                    });
                                                  }}
                                                >
                                                  Edit
                                                </li>
                                                <li
                                                  style={{}}
                                                  onClick={() => {
                                                    setMobileDeets({});
                                                    DeleteConfirmation(
                                                      data["_id"],
                                                      "post"
                                                    );
                                                  }}
                                                >
                                                  Delete
                                                </li>
                                              </>
                                            )}
                                          </>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="content-container"
                                  onClick={clickHandler}
                                >
                                  {
                                    check_content(data["content"]).props
                                      .children
                                  }
                                  {data["image"] && (
                                    <img
                                      src={data["image"]}
                                      className="image-content"
                                    ></img>
                                  )}
                                </div>
                              </div>
                            </div>
                            {screen > 500 && (
                              <ul className="deets-l">
                                {validation && (
                                  <>
                                    <li
                                      className={
                                        Deets.index === index &&
                                        Deets.id === data["_id"]
                                          ? "active"
                                          : ""
                                      }
                                      style={{ backgroundColor: "lightblue" }}
                                      onClick={() => {
                                        reply(data["_id"]);
                                      }}
                                      onMouseOver={() => {
                                        setDeets({
                                          index: index,
                                          id: data["_id"],
                                        });
                                      }}
                                      onMouseOut={() => {
                                        setDeets(-1);
                                      }}
                                    >
                                      Reply
                                    </li>

                                    {CurrUser === data["username"] && (
                                      <>
                                        <li
                                          className={
                                            Deets.index === index + 1 &&
                                            Deets.id === data["_id"]
                                              ? "active"
                                              : ""
                                          }
                                          style={{
                                            backgroundColor: "limegreen",
                                          }}
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
                                            DeleteConfirmation(
                                              data["_id"],
                                              "post"
                                            );
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
                                    )}
                                  </>
                                )}
                              </ul>
                            )}
                          </div>
                        );
                    if (ActiveContent === "replies")
                      if (data.type === "reply")
                        return (
                          <div className="PostReply-main">
                            <div className="Replies Comments" id={data["_id"]}>
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
                                      onDislike(
                                        data["_id"],
                                        data["score"],
                                        {
                                          headers: token,
                                        },
                                        CurrUser
                                      );
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
                                      <img
                                        alt="profile-pic"
                                        src={data["avatar"]}
                                      ></img>
                                    </div>
                                    {userName(data["username"], navigate)}
                                  </div>
                                  <p className="date">{data["createdAt"]}</p>
                                  {screen < 500 && (
                                    <div className="deets-m">
                                      <span>
                                        <svg
                                          onClick={() => {
                                            setMobileDeets({
                                              deetsId: index,
                                              deets: !MobileDeets.deets,
                                            });
                                          }}
                                          className="deets-img"
                                          data-name="Layer 1"
                                          id="Layer_1"
                                          viewBox="0 0 200 200"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path d="M114.17,56.87A14.17,14.17,0,1,1,100,42.7,14.18,14.18,0,0,1,114.17,56.87Zm-24.74,0A10.57,10.57,0,1,0,100,46.3,10.58,10.58,0,0,0,89.43,56.87Z" />
                                          <path d="M114.17,100A14.17,14.17,0,1,1,100,85.83,14.19,14.19,0,0,1,114.17,100Zm-24.74,0A10.57,10.57,0,1,0,100,89.43,10.58,10.58,0,0,0,89.43,100Z" />
                                          <path d="M114.17,143.13A14.17,14.17,0,1,1,100,129,14.19,14.19,0,0,1,114.17,143.13Zm-24.74,0A10.57,10.57,0,1,0,100,132.57,10.58,10.58,0,0,0,89.43,143.13Z" />
                                        </svg>
                                      </span>
                                      <ul
                                        className={
                                          MobileDeets.deetsId === index &&
                                          MobileDeets.deets
                                            ? "deets-opt active"
                                            : "deets-opt"
                                        }
                                      >
                                        {validation && (
                                          <>
                                            <li>Reply</li>
                                            {CurrUser === data["username"] && (
                                              <>
                                                <li
                                                  onClick={() => {
                                                    setMobileDeets({});
                                                    Edit(data["_id"]);
                                                  }}
                                                >
                                                  Edit
                                                </li>
                                                <li
                                                  style={{}}
                                                  onClick={() => {
                                                    setMobileDeets({});
                                                    DeleteConfirmation(
                                                      data["_id"],
                                                      "post"
                                                    );
                                                  }}
                                                >
                                                  Delete
                                                </li>
                                              </>
                                            )}
                                          </>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="content-container"
                                  onClick={clickHandler}
                                >
                                  {
                                    check_content(data["content"]).props
                                      .children
                                  }
                                  {data["image"] && (
                                    <img
                                      src={data["image"]}
                                      className="image-content"
                                    ></img>
                                  )}
                                </div>
                              </div>
                            </div>
                            {screen > 500 && (
                              <ul className="deets-l">
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
                                    setDeets({
                                      index: index,
                                      id: data["_id"],
                                    });
                                  }}
                                  onMouseOut={() => {
                                    setDeets(-1);
                                  }}
                                >
                                  Reply
                                </li>
                                <>
                                  {validation &&
                                  CurrUser === data["username"] ? (
                                    <>
                                      <li
                                        className={
                                          Deets.index === index + 1 &&
                                          Deets.id === data["_id"]
                                            ? "active"
                                            : ""
                                        }
                                        style={{
                                          backgroundColor: "limegreen",
                                        }}
                                        onClick={() => {
                                          setEditModal({
                                            id: index,
                                            edit: true,
                                          });
                                        }}
                                        onMouseOver={() => {
                                          setDeets({
                                            index: index + 1,
                                            id: data["_id"],
                                          });
                                        }}
                                        onMouseOut={() => {
                                          Deets[1](-1);
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
                                          DeleteConfirmation(
                                            data["_id"],
                                            "post"
                                          );
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
                                </>
                              </ul>
                            )}
                          </div>
                        );
                  })}
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
