import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-notifications/lib/notifications.css";
import SelectProfilepic from "./LoginCreatePage/CreateAvatar";
import { NotificationContainer } from "react-notifications";
import LoginPage from "./LoginCreatePage/LoginPage";
import Create from "./LoginCreatePage/CreateAcc";
import Home from "./Home/HomePage";
import Profile from "./HomeComponents/ProfliePage";
import SearchedContent from "./HomeComponents/SearchedContent";
import Chats from "./HomeComponents/chat";
import { validate } from "./token";
export const Screen = React.createContext();
export const Validation = React.createContext();

function R(props) {
  const [validation, setValidation] = useState(validate(localStorage.getItem('token')).login);
  const [width, setWidth] = useState(window.screen.width);
  useEffect(() => {
    window.addEventListener("resize", () => {
      setWidth(window.screen.width);
    });
  });
  return (
    <Router>
      <Screen.Provider value={width}>
        <Validation.Provider value={[validation, setValidation]}>
          <Routes>
            <Route exact path="/" element={<LoginPage />} />
            <Route exact path="/create" element={<Create />} />
            <Route
              exact
              path="/create/:username/avatar"
              element={<SelectProfilepic />}
            />
            <Route exact path="/user/:username" element={<Home />} />
            <Route
              exact
              path="/user/:username/profile"
              element={<Profile />}
            ></Route>
            <Route
              exact
              path="/user/:username/search"
              element={<SearchedContent />}
            ></Route>
            <Route
              exact
              path="/user/:username/chats"
              element={<Chats />}
            ></Route>
          </Routes>
        </Validation.Provider>
      </Screen.Provider>
      <NotificationContainer />
    </Router>
  );
}

export default R;
