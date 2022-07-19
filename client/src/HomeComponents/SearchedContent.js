import { useNavigate, useSearchParams } from "react-router-dom";
import React, { useContext, useState } from "react";
import axios from "axios";
import { validate } from "../token";
import Nothing, { onDislike, onLike, userName, check_content } from "../Functions";
import "../styles/HomePage1.css";
import Loading from "../Loading/Load";
import EditContent from "../EditDeleteModals/Edit";
import Delete from "../EditDeleteModals/Delete";
// import Nothing from "../Functions";
import NavBar from "./Navbar";
import socket from "../Socket";

const CurrUser = React.createContext();

function DisplayUsers(props) {
  const navigate = useNavigate();
  const user = useContext(CurrUser);
  return (
    <div className="All-users">
      <h1>{props.users.length > 0 ? "Users" : "No Users"}</h1>
      <div className="recUsers">
        {props.users.map((data) => {
          return (
            <div
              className="user"
              onClick={() => {
                navigate(`/user/${user}/profile`, {
                  state: { username: data["username"] },
                });
              }}
            >
              <img src={data["avatar"]}></img>
              <p>{data["username"]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchedContent() {
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const [SearchedData, setSearchedData] = useState();
  const param = search.get("content");
  const [DeleteModal, setDeleteModal] = useState({ delete: false, id: "" });
  const [Deets, setDeets] = useState({ index: -1, id: "" });
  const [EditModal, setEditModal] = useState({ edit: false, id: "" });
  const [Reply, setReply] = useState({ index: -1, reply: false });
  const token = localStorage.getItem("token");
  const user = validate(token);

  React.useEffect(() => {
    const data = { comments: [], users: [] };
    socket.emit("searchData", param);
    socket.on("searchData", (Data) => {
      if (Data.users.length > 0) data["users"] = Data.users;
      else data["users"] = null;
      if (Data.comments.length > 0) data["comments"] = Data.comments;
      else data.comments = null;
      setSearchedData(data);
    });
  }, [param]);

  React.useEffect(() => {
    socket.once("Updated", (data) => {});
  });

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
      span.onClick = navigate(`/user/${user}/profile`, {
        state: { username: span.innerText },
      });
    }
  };

  return SearchedData !== undefined ? (
    <>
      <NavBar></NavBar>
      <CurrUser.Provider value={user}>
        <div className="PostReply-container">
          {SearchedData.users === null && SearchedData.comments === null ? (
            <Nothing></Nothing>
          ) : SearchedData.users !== null || SearchedData.comments !== null ? (
            <>
              {SearchedData.users !== null ? (
                <DisplayUsers users={SearchedData.users}></DisplayUsers>
              ) : (
                <></>
              )}
              {SearchedData.comments !== null ? (
                SearchedData.comments.map((data, index) => {
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
                                    onLike(data["_id"], data["score"], {
                                      headers: token,
                                    });
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
                                    onDislike(data["_id"], data["score"]);
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
                            {user === data["username"] ? (
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
                      </div>
                    </>
                  );
                })
              ) : (
                <></>
              )}
            </>
          ) : (
            <Loading></Loading>
          )}
        </div>
      </CurrUser.Provider>
    </>
  ) : (
    <Loading></Loading>
  );
}

export default SearchedContent;
