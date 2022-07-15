import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-notifications/lib/notifications.css';
import LoginPage from "./LoginCreatePage/LoginPage"
import Create from "./LoginCreatePage/CreateAcc"
import Home from './Home/HomePage';
import SelectProfilepic from './avatars/CreateAvatar'
import { NotificationContainer } from 'react-notifications';
import Profile from './HomeComponents/ProfliePage';
import SearchedContent from './HomeComponents/SearchedContent';
import Chats from './HomeComponents/chat';

function R(props){
    return(
            <Router >
                <Routes>
                    <Route exact path="/" element={<LoginPage/>} />
                    <Route exact path="/create/user" element={<Create/>} />
                    <Route exact path="/create/:username/avatar" element = {<SelectProfilepic/>}/>
                    <Route exact path="/user/:username" element={<Home/>} />
                    <Route exact path="/user/:username/profile" element={<Profile/>}></Route>
                    <Route exact path="/user/:username/search" element={<SearchedContent/>}></Route>
                    <Route exact path="/user/:username/chats" element={<Chats/>}></Route>
                </Routes>
                <NotificationContainer />
            </Router >
    )
}

export default R;