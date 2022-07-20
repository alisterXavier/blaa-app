import React, { useContext, useReducer, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import socket from "../Socket";
import { validate } from "../token";
import { UploadImg } from "../Functions";

function NavBar() {
  const navigate = useNavigate();
  const validation = sessionStorage.getItem("SignedIn");
  let CurrUser = validate(localStorage.getItem("token"));
  const [searchbar, setSearchbar] = useState(false);
  const [NewPost, setNewPost] = useState(false);
  const [Content, setContent] = useState("");
  const [Avatar, setAvatar] = useState("");
  const [SearchedData, setSearchedData] = useState("");
  const [Image, setImage] = useState(null);
  const [navBar, setNavBar] = useState(false);
  const token = localStorage.getItem("token");
  React.useEffect(() => {
    socket.emit("Nav-data", CurrUser);
    socket.on("recieve-Nav-data", (data) => {
      setAvatar(data);
    });
  }, [CurrUser]);

  const nav_Cross_Active = (e) => {
    setNavBar(!navBar);
    const { children } = e.currentTarget;
    for (const x in children) {
      if (children.hasOwnProperty(x)) {
        if (navBar) {
          children[x].classList.remove("active");
        } else {
          children[x].classList.add("active");
        }
      }
    }
  };

  const handleClick = async (e) => {
    const { id } = e.target;
    if (id === "search") {
      setSearchbar(!searchbar);
    } else if (id === "new-comment" || id === "cancel") {
      setNewPost(!NewPost);
    } else if (id === "Post-btn") {
      if (Content.length > 0) {
        const url = await UploadImg(Image);
        let data = {
          Username: CurrUser,
          Content,
          Image: url,
        };

        axios.post(
          process.env.REACT_APP_baseServerurl + "/user/:username/store/post",
          data,
          { headers: { authorization: token } }
        );

        setTimeout(() => {
          setNewPost(!NewPost);
          setContent("");
        }, 500);
      } else {
        document.getElementById("content").classList.add("warning");
        setTimeout(() => {
          document.getElementById("content").classList.remove("warning");
        }, 6000);
      }
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  return (
    <div style={{ width: "100px" }}>
      <div className={searchbar ? "overlay active" : "overlay"}></div>
      <div className="nav-lines-container active" onClick={nav_Cross_Active}>
        <span className="nav-lines"></span>
        <span className="nav-lines"></span>
      </div>
      <div className={navBar ? "navbar-container active" : "navbar-container"}>
        <div className="navbar">
          <div className="search navbar-content">
            <p
              onClick={handleClick}
              id="search"
              style={{ color: "white" }}
            >
              Search
            </p>
          </div>
          <div className="Home navbar-content">
            <p
              id="Home"
              style={{ color: "white" }}
            >
              Home
            </p>
          </div>
          <div className="user-profile navbar-content">
            {validation || CurrUser !== undefined ? (
              <img
                alt="Profile-pic"
                id="Profile"
                onClick={() => {
                  navigate(`/user/${CurrUser}/profile`, {
                    state: { username: CurrUser },
                  });
                }}
                src={Avatar !== undefined ? Avatar.avatar : ""}
              ></img>
            ) : (
              <div className="Please-Login">
                <Link
                  className="Login-Signup"
                  id="Profile"
                  to="/"
                >
                  Login
                </Link>
              </div>
            )}
            <div id="user-tag" className="tag">
              <p>
                {validation || CurrUser !== undefined
                  ? "Profile"
                  : "Login/Signup"}
              </p>
            </div>
          </div>

          {validation || CurrUser !== undefined ? (
            <>
              <div className="new-comment navbar-content">
                <p
                  className="post"
                  id="new-comment"
                  onClick={handleClick}
                  style={{ color: "white" }}
                >
                  Post
                </p>
              </div>
              <div className="chats navbar-content">
                <p
                  id="chats"
                  style={{ color: "white" }}
                >
                  Chat
                </p>
              </div>
              <div className="logOut navbar-content">
                <Link
                  to="/user/home"
                  onClick={() => {
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("SignedIn");
                  }}
                >
                  LogOut
                </Link>
                {/* <div className="logOut-tag"></div> */}
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <div
          className={
            searchbar ? "searchbar-container active" : "searchbar-container"
          }
        >
          <input
            type="search"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/user/${CurrUser}/search?content=${SearchedData}`);
                setSearchbar(false);
              }
            }}
            placeholder="Search"
            onChange={(e) => {
              setSearchedData(e.target.value);
            }}
          ></input>
        </div>
        <div id="new-post" className={NewPost === true ? "active" : ""}>
          <div id="textarea-container">
            <div className="post-container">
              <textarea
                id="content"
                placeholder="Enter Text...."
                value={Content}
                onChange={handleChange}
              ></textarea>
              <div className="button-container">
                <p id="cancel" onClick={handleClick}>
                  Cancel
                </p>
                <div className="Post-btn-container">
                  <button id="Post-btn" onClick={handleClick}>
                    Post
                  </button>
                  <div className="upload-container">
                    <input
                      type="file"
                      id="upload-img"
                      onChange={(e) => {
                        document.getElementById("fileSelected").textContent =
                          e.target.files[0].name;
                        setImage(e.target.files[0]);
                      }}
                      hidden
                    />
                    <label for="upload-img">Upload</label>
                    <span id="fileSelected">No file selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
