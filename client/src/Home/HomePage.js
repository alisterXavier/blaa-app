import React, { useContext, useState } from "react";
import Delete from "../EditDeleteModals/Delete";
import EditContent from "../EditDeleteModals/Edit";
import NavBar from "../HomeComponents/Navbar";
import ReplyContainer from "../EditDeleteModals/Reply";
import "./styles/HomePage1.css";
import { useNavigate } from "react-router-dom";
import socket from "../Socket";
import { Loading } from "../Loading/Load";
import { validate } from "../token";
import { check_content, onDislike, onLike, userName } from "../Functions";
import { Screen, Validation } from "../Routes";

var token;
export const username = React.createContext();

function Replies(props) {
  const navigate = useNavigate();
  const [seeReplies, setSeeReplies] = useState(false);
  const [Deets, setDeets] = useState({ index: -1, id: "" });
  const [MobileDeets, setMobileDeets] = useState({ deetsId: -1, deets: false });
  const validation = useContext(Validation);
  var CurrUser = useContext(username);
  var screen = useContext(Screen);
  return (
    <div className="Replies-wrapper">
      {props.MainData !== undefined && (props.replies <= 1 || seeReplies) ? (
        props.MainData.map((data, index) => {
          if (data["type"] === "reply" && data["main"] === props.commentId) {
            return (
              <div className="Replies-main">
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
                          <img alt="profile-pic" src={data["avatar"]}></img>
                        </div>
                        {userName(data["username"], navigate)}
                      </div>
                      <p className="date">{data["createdAt"]}</p>
                      {screen < 900 && (
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
                              MobileDeets.deetsId === index && MobileDeets.deets
                                ? "deets-opt active"
                                : "deets-opt"
                            }
                          >
                            {validation[0] && (
                              <>
                                <li>Reply</li>
                                {CurrUser === data["username"] && (
                                  <>
                                    <li
                                      onClick={() => {
                                        setMobileDeets({});
                                        props.Edit(data["_id"]);
                                      }}
                                    >
                                      Edit
                                    </li>
                                    <li
                                      style={{}}
                                      onClick={() => {
                                        setMobileDeets({});
                                        props.DeleteConfirmation(
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
                      onClick={props.clickHandler}
                    >
                      {check_content(data["content"]).props.children}
                      {data["image"] && (
                        <img
                          src={data["image"]}
                          className="image-content"
                        ></img>
                      )}
                    </div>
                  </div>
                </div>
                {screen > 900 && (
                  <ul className="deets-l">
                    {validation[0] && (
                      <>
                        <li
                          className={
                            Deets.index === index && Deets.id === data["_id"]
                              ? "active"
                              : ""
                          }
                          style={{ backgroundColor: "lightblue" }}
                          onClick={() => {
                            setDeets({});
                            props.reply(index);
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
                        {CurrUser === data["username"] && (
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
                                setDeets({});
                                props.Edit(data["_id"]);
                              }}
                              onMouseOver={() => {
                                setDeets({
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
                                Deets.index === index + 2 &&
                                Deets.id === data["_id"]
                                  ? "active"
                                  : ""
                              }
                              style={{ backgroundColor: "#FF928E" }}
                              onClick={() => {
                                setDeets({});
                                props.DeleteConfirmation(data["_id"], "post");
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
  const [EditModal, setEditModal] = useState({ edit: false, id: -1 });
  const [Reply, setReply] = useState({ index: -1, reply: false });
  const [MobileDeets, setMobileDeets] = useState({ deetsId: -1, deets: false });
  const CurrUser = useContext(username);
  const validation = useContext(Validation);
  const screen = useContext(Screen);
  const DeleteConfirmation = (id, type, cId) => {
    setDeleteModal((DeleteModal) => ({
      delete: true,
      id: id,
      type: type,
      commentId: cId,
    }));
  };

  const Edit = (id) => {
    setEditModal({
      edit: true,
      id: id,
    });
  };

  const reply = (e) => {
    if (e === Reply.index) setReply({});
    else setReply({ id: e, reply: true });
  };

  const clickHandler = (e) => {
    const span = e.target.closest("p > .taggedUser");
    if (span !== null) {
      span.onClick = navigate(`/user/${CurrUser}/profile`, {
        state: { username: span.innerText },
      });
    }
  };

  const newUpdate = async () => {
    const newU = document.getElementsByClassName("PostReply-container")[0]
      .children[0];
    newU.classList.add("new");
    setTimeout(() => {
      newU.classList.remove("new");
    }, 1000);
  };

  React.useEffect(() => {
    if (props.MainData !== undefined && MainDisplay !== undefined)
      if (props.MainData.length > MainDisplay.length) {
        newUpdate();
      }
    setMainDisplay(props.MainData);
  }, [props.MainData, MainDisplay]);

  return (
    <username.Provider value={CurrUser}>
      <div className="PostReply-container">
        {DeleteModal.delete && (
          <Delete
            DeleteModal={[
              DeleteModal,
              setDeleteModal,
              CurrUser,
              setMobileDeets,
              setDeets,
            ]}
          ></Delete>
        )}
        {EditModal.edit && (
          <EditContent Edit={[EditModal, setEditModal]}></EditContent>
        )}
        {MainDisplay !== undefined ? (
          MainDisplay.map((data, index) => {
            if (data["type"] === "post") {
              return (
                <>
                  <div className="Post-Reply-wrapper">
                    <div className="PostReply-main">
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
                            {screen < 900 && (
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
                                  {validation[0] && (
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
                                              Edit(data["_id"]);
                                            }}
                                          >
                                            Edit
                                          </li>
                                          <li
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
                            {check_content(data["content"]).props.children}

                            <img
                              src={data["image"]}
                              className="image-content"
                            ></img>
                          </div>
                        </div>
                      </div>
                      {screen > 900 && (
                        <ul className="deets-l">
                          {validation[0] && (
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
                                  setDeets({ index: index, id: data["_id"] });
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
                              )}
                            </>
                          )}
                        </ul>
                      )}
                    </div>
                    <Replies
                      replies={data["replies"].length}
                      // validation={props.validation}
                      Deets={[Deets, setDeets]}
                      MobileDeets={[MobileDeets, setMobileDeets]}
                      DeleteConfirmation={DeleteConfirmation}
                      DeleteModal={[DeleteModal, setDeleteModal]}
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
        {Reply.reply && (
          <ReplyContainer
            reply={[Reply, setReply]}
            CurrUser={CurrUser}
          ></ReplyContainer>
        )}
      </div>
    </username.Provider>
  );
}

function Home() {
  const validation = useContext(Validation);
  const [MainData, setMainData] = useState();

  var CurrUser;
  if (validation[0]) {
    CurrUser = validate(localStorage.getItem("token")).username;
    token = {
      authorization: localStorage.getItem("token"),
    };
  }

  React.useEffect(() => {
    socket.emit("content");
    // setScreen(window.screen.width)
    // window.addEventListener("resize", () => {
    //   setScreen(window.screen.width)
    // })
  }, []);

  React.useEffect(() => {
    if (localStorage.getItem("token") === null) validation[1](false);

    socket.once("get-data", (data) => {
      setMainData(data);
    });

    socket.once("Updated", (data) => {
      setMainData(data);
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
          <Content MainData={MainData}></Content>
        )}
      </username.Provider>
    </div>
  );
}

export default Home;
