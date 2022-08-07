import React, { useContext, useState } from "react";
import "./styles/LoginPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Validation } from "../Routes";

let c = 0;
if (localStorage.getItem("Mode") === "dark") c = 1;

function LoginPage() {
  const navigate = useNavigate();
  const validation = useContext(Validation);
  localStorage.removeItem("ActivePage");
  const mode = localStorage.getItem("Mode");
  const [Username, setUsername] = useState("");
  const [PassVisibility, setPassVisibility] = useState(true);
  const [Authentication, setAuthentication] = useState();
  const [Dark, setDark] = useState(mode === null ? "light" : mode);

  const handlePassVisibility = () => {
    setPassVisibility(!PassVisibility);
  };

  const onChange = (e) => {
    const { id } = e.target;
    if (id === "username") setUsername(e.target.value);
  };

  const handleFeedback = () => {
    document.getElementById("Login-feedback").style.animation =
      "slideout 500ms ease";
    setTimeout(() => {
      setAuthentication();
    }, 400);
  };

  const handleLoginFeed = () => {
    if (Authentication !== undefined) {
      return (
        <div onClick={handleFeedback} className="feedback-container">
          <div onClick={handleFeedback} id="Login-overlay"></div>
          <div onClick={handleFeedback} id="Login-feedback">
            <p onClick={handleFeedback} id="feedback-text">
              {Authentication
                ? "Thou shall enter"
                : "Thou shan't enter. Please check your username and password"}
            </p>
          </div>
        </div>
      );
    }
  };

  const handleClick = async (e) => {
    const password = document.getElementById("password");
    // const { id, className } = e.target;
    if (Username === "") {
      const username = document.getElementById("username");
      username.style.borderLeft = "1px solid red";
      username.style.borderBottom = "1px solid red";
      username.placeholder = "Enter a valid username";
      username.classList.add("warningActive");
      setTimeout(() => {
        username.style.borderLeft = ".5px solid white";
        username.style.borderBottom = ".5px solid white";
        username.placeholder = "Username";
        username.classList.remove("warningActive");
      }, 3000);
    }
    if (password.value === "") {
      password.style.borderLeft = "1px solid red";
      password.style.borderBottom = "1px solid red";
      password.placeholder = "Enter a valid password";
      password.classList.add("warningActive");
      setTimeout(() => {
        password.style.borderLeft = ".5px solid white";
        password.style.borderBottom = ".5px solid white";
        password.placeholder = "Password";
        password.classList.remove("warningActive");
      }, 3000);
    }
    if (Username.length > 0 && password.value.length > 0) {
      const data = {
        Username,
        Password: password.value,
      };
      axios
        .post(process.env.REACT_APP_baseServerurl + "/login", data)
        .then((res) => {
          if (res.data.login) {
            setAuthentication(res.data.login);
            localStorage.setItem("token", res.data.token);
            sessionStorage.setItem("SignedIn", true);
            validation[1](true);
          }
        })
        .catch((err) => {
          setAuthentication(false);
        });
    }
  };

  const SwitchDark_Light = () => {
    setDark(Dark === "light" ? "dark" : "light");
    const container = document.getElementsByClassName(
      "Credentials-container"
    )[0];

    c += 1;

    const backgroundPos = (100 / 3) * 2 * c;
    container.style.backgroundPosition = `${backgroundPos}%`;
  };

  React.useEffect(() => {
    const login = document.getElementsByClassName("Login")[0];
    const loginChildren = login.getElementsByTagName("input");

    localStorage.setItem("Mode", Dark);

    if (Authentication === true) {
      setTimeout(() => {
        sessionStorage.setItem("SignedIn", "true");
        navigate(`user/${Username}`, {
          state: { validation: true, username: Username },
        });
      }, 2000);
    }

    if (Dark === "light") {
      login.style.color = "var(--text-dark-color)";
      for (const key in login.getElementsByTagName("input"))
        if (loginChildren.hasOwnProperty(key))
          loginChildren[key].style.color = "var(--text-dark-color)";
    } else {
      login.style.color = "var(--text-light-color)";
      for (const key in loginChildren)
        if (loginChildren.hasOwnProperty(key))
          loginChildren[key].style.color = "var(--text-light-color)";
    }
  });

  React.useEffect(() => {
    const container = document.getElementsByClassName(
      "Credentials-container"
    )[0];

    if (localStorage.getItem("token")) {
      axios
        .post(
          process.env.REACT_APP_baseServerurl + "/login",
          {},
          { headers: { authorization: localStorage.getItem("token") } }
        )
        .then((res) => {
          setAuthentication(res.data.login);
          setUsername(res.data.username);
          validation[1](res.data.login)
        })
        .catch((err) => console.log(err));
    }

    if (Dark === "dark") {
      document.getElementsByClassName("toggle")[0].checked = true;
      container.style.backgroundPosition = "66.6667% center";
    }
  }, [Dark]);

  return (
    <div className="Credentials-container">
      <div className="toggle-container">
        <input
          className="toggle"
          id="modeToggle"
          type="checkbox"
          onClick={SwitchDark_Light}
        ></input>
      </div>
      <div className="Login">
        <div>
          <h1>Login</h1>
          <p>Username: </p>
          <input
            type="text"
            id="username"
            autoComplete="off"
            value={Username}
            onChange={onChange}
            placeholder="Username"
          ></input>
          <p>Password: </p>
          <div className="password-container">
            <input
              type={PassVisibility ? "password" : "text"}
              autoComplete="off"
              id="password"
              onChange={onChange}
              placeholder="Password"
            ></input>
            {PassVisibility ? (
              <svg
                className="toggleVis"
                version="1.1"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                onClick={handlePassVisibility}
              >
                <g>
                  <path
                    d="M8.10869891,20.8913011 C4.61720816,18.8301147 3,16 3,16 C3,16 7,9 16,9 C17.3045107,9 18.5039752,9.14706466 19.6014388,9.39856122 L16.8986531,12.1013469 C16.6097885,12.0350342 16.3089856,12 16,12 C13.7908609,12 12,13.7908609 12,16 C12,16.3089856 12.0350342,16.6097885 12.1013469,16.8986531 L8.10869891,20.8913011 L8.10869891,20.8913011 L8.10869891,20.8913011 Z M12.398561,22.601439 C13.4960246,22.8529356 14.6954892,23.0000001 16,23 C25,22.999999 29,16 29,16 C29,16 27.3827918,13.1698856 23.8913008,11.1086992 L19.8986531,15.1013469 C19.9649658,15.3902115 20,15.6910144 20,16 C20,18.2091391 18.2091391,20 16,20 C15.6910144,20 15.3902115,19.9649658 15.1013469,19.8986531 L12.398561,22.601439 L12.398561,22.601439 L12.398561,22.601439 Z M19,16 C19.0000001,16.7677669 18.7071068,17.5355339 18.1213203,18.1213203 C17.5355339,18.7071068 16.7677669,19.0000001 16,19 L19,16 L19,16 L19,16 Z M16,13 C15.2322331,12.9999999 14.4644661,13.2928932 13.8786797,13.8786797 C13.2928932,14.4644661 12.9999999,15.2322331 13,16 L16,13 L16,13 L16,13 Z M24,7 L7,24 L8,25 L25,8 L24,7 L24,7 Z"
                    id="eye-hidden"
                  />
                </g>
              </svg>
            ) : (
              <svg
                className="toggleVis"
                version="1.1"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                onClick={handlePassVisibility}
              >
                <g>
                  <path d="M447.1,256.2C401.8,204,339.2,144,256,144c-33.6,0-64.4,9.5-96.9,29.8C131.7,191,103.6,215.2,65,255l-1,1l6.7,6.9   C125.8,319.3,173.4,368,256,368c36.5,0,71.9-11.9,108.2-36.4c30.9-20.9,57.2-47.4,78.3-68.8l5.5-5.5L447.1,256.2z M256,336   c-44.1,0-80-35.9-80-80c0-44.1,35.9-80,80-80c44.1,0,80,35.9,80,80C336,300.1,300.1,336,256,336z" />
                  <path d="M250.4,226.8c0-6.9,2-13.4,5.5-18.8c-26.5,0-47.9,21.6-47.9,48.2c0,26.6,21.5,48.1,47.9,48.1s48-21.5,48-48.1v0   c-5.4,3.5-11.9,5.5-18.8,5.5C266,261.6,250.4,246,250.4,226.8z" />
                </g>
              </svg>
            )}
          </div>
          <div className="login-btnc">
            <div className="popup-bg">
              <button
                id="Account-btn"
                onClick={handleClick}
                onMouseOver={() => {document.getElementById("Text-gradient").classList.add("active");}}
                onMouseOut={() => {
                  document
                    .getElementById("Text-gradient")
                    .classList.remove("active");
                }}
              >
                <span id="Text-gradient">Login</span>
              </button>
            </div>
          </div>
          <div>
            <button
              className="createAcc"
              onClick={() => {
                navigate(`create`);
              }}
            >
              Create new account
            </button>
          </div>
        </div>
      </div>
      {handleLoginFeed()}
    </div>
  );
}

export default LoginPage;

// Thou shall not enter
