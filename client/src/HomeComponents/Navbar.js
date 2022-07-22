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
      setNavBar(false);
      const lines = document.getElementsByClassName("nav-lines");
      for (const x in lines) {
        if (lines.hasOwnProperty(x)) {
          lines[x].classList.remove("active");
        }
      }
      setSearchbar(!searchbar);
    } else if (id === "new-comment" || id === "cancel") {
        if(id === "new-comment"){
            setNavBar(false);
            const lines = document.getElementsByClassName("nav-lines");
            for (const x in lines) {
              if (lines.hasOwnProperty(x)) {
                lines[x].classList.remove("active");
              }
            }
        }
      setNewPost(!NewPost);
    } else if (id === "Post-btn") {
      if (Content.length > 0) {
        const url = await UploadImg(Image);
        let data = {
          Username: CurrUser,
          Content,
          Image: url,
        };

        axios
          .post(
            process.env.REACT_APP_baseServerurl + "/user/:username/store/post",
            data,
            { headers: { authorization: token } }
          )

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
      <div className="nav-lines-container" onClick={nav_Cross_Active}>
        <span className="nav-lines"></span>
        <span className="nav-lines"></span>
      </div>
      <div className={navBar ? "navbar-container active" : "navbar-container"}>
        <div className="navbar">
          <div className="search navbar-content">
            <svg
              className="icons"
              id="search-icon"
              version="1.1"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="myGradient" gradientTransform="rotate()">
                  <stop offset="10%" stop-color="white" />
                  <stop offset="98%" stop-color="black" />
                </linearGradient>
              </defs>
              <path d="M27.414,24.586l-5.077-5.077C23.386,17.928,24,16.035,24,14c0-5.514-4.486-10-10-10S4,8.486,4,14  s4.486,10,10,10c2.035,0,3.928-0.614,5.509-1.663l5.077,5.077c0.78,0.781,2.048,0.781,2.828,0  C28.195,26.633,28.195,25.367,27.414,24.586z M7,14c0-3.86,3.14-7,7-7s7,3.14,7,7s-3.14,7-7,7S7,17.86,7,14z" />
            </svg>
            <p onClick={handleClick} id="search">
              Search
            </p>
          </div>
          <div className="Home navbar-content">
            <svg
              className="icons"
              id="Home-icon"
              version="1.1"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Expanded">
                <g>
                  <g>
                    <path d="M42,48H28V35h-8v13H6V27c0-0.552,0.447-1,1-1s1,0.448,1,1v19h10V33h12v13h10V28c0-0.552,0.447-1,1-1s1,0.448,1,1V48z" />
                  </g>
                  <g>
                    <path d="M47,27c-0.249,0-0.497-0.092-0.691-0.277L24,5.384L1.691,26.723c-0.399,0.381-1.032,0.368-1.414-0.031     c-0.382-0.399-0.367-1.032,0.031-1.414L24,2.616l23.691,22.661c0.398,0.382,0.413,1.015,0.031,1.414     C47.526,26.896,47.264,27,47,27z" />
                  </g>
                  <g>
                    <path d="M39,15c-0.553,0-1-0.448-1-1V8h-6c-0.553,0-1-0.448-1-1s0.447-1,1-1h8v8C40,14.552,39.553,15,39,15z" />
                  </g>
                </g>
              </g>
            </svg>
            <p
              id="Home"
              onClick={() => {
                if (window.location.pathname === `/user/${CurrUser}`)
                  window.location.reload();
                else navigate(`/user/${CurrUser}`);
              }}
            >
              Home
            </p>
          </div>
          <div className="user-profile navbar-content">
            {validation || CurrUser !== undefined ? (
              <>
                <p
                  id="Profile"
                  onClick={() => {
                    navigate(`/user/${CurrUser}/profile`, {
                      state: { username: CurrUser },
                    });
                  }}
                >
                  Profile
                </p>
                <img
                  alt="Profile-pic"
                  id="Profile-pic"
                  src={Avatar !== undefined ? Avatar.avatar : ""}
                ></img>
              </>
            ) : (
              <div className="Please-Login">
                <Link className="Login-Signup" id="Profile" to="/">
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
                <p className="post" id="new-comment" onClick={handleClick}>
                  Post
                </p>
              </div>
              <div className="chats navbar-content">
                <p
                  id="chats"
                  onClick={() => {
                    navigate(`/user/${CurrUser}/chats`);
                  }}
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
      </div>
      <div
        className={
          searchbar ? "searchbar-container active" : "searchbar-container"
        }
      >
        <input
          type="search"
          onKeyDown={(e) => {
            const { key } = e;
            if (key === "Enter") {
              navigate(`/user/${CurrUser}/search?content=${SearchedData}`);
              setSearchbar(false);
            }
            if (key === "Escape") {
              setSearchbar(false);
              setSearchedData("");
            }
          }}
          value={SearchedData}
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
  );
}

export default NavBar;
