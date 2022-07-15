import React, { useState } from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import "../styles/CreatePage.css";
import { useNavigate } from 'react-router-dom';
const jsonData = require('./avatars.json'); 

var url = null
function CreateAvatar(props) {
    const avatarUrl=[]
    const avatarurl = "https://avataaars.io/?" 
    const avatarFeatures= {}
    let gender = 1;
    for(var x=0; x<4; x++, gender++){
        for(const keys in jsonData){
            let selector = Math.round(Math.random() * (jsonData[keys].length - 1))
            if(gender%2 === 0){
                if(keys === "facialHairType"){
                    while(jsonData["facialHairType"][selector] !== "Blank"){
                        selector = Math.round(Math.random() * (jsonData[keys].length - 1))
                    }
                }
            }
            avatarFeatures[keys] = jsonData[keys][selector]
        }
        avatarUrl.push(`${avatarurl}avatarStyle=${avatarFeatures['avatar-style']}&topType=${avatarFeatures['topType']}&accessoriesType=${avatarFeatures['accessoriesType']}&hairColor=${avatarFeatures['hairColor']}&facialHairType=${avatarFeatures['facialHairType']}&clotheType=${avatarFeatures['clotheType']}&eyeType=${avatarFeatures['avatar-style']}&eyebrowType=${avatarFeatures['eyeType']}&mouthType=${avatarFeatures['mouthType']}&skinColor=${avatarFeatures['skinColor']}`)
    }

    const handleSelect = (e) => {
        const { src } = e.target
        const images = document.getElementsByClassName("select-avatar")
        for(var image in images){
            if(images.hasOwnProperty(image)){
                images[image].classList.remove("active")
            }
        }
        e.target.classList.add("active")
        url = src
    }

    return(
        <>
            {avatarUrl.map((data, index) => {
                return(
                   <div style={{width: "80%", display: "flex", justifyContent:"center"}}>
                        <img src={data} className="select-avatar" alt="avatars" onClick={handleSelect}></img>
                   </div>
                )
            })}
        </>
    )
}

function SelectProfilepic(){
    const navigate = useNavigate();
    const { username } = useParams();
    const [refresh, setRefresh] = useState(false)

    const handleClick = () => {
        if(url !== null){
            const avatarData = {
                username: username,
                avatar: url
            }
            axios.post(process.env.REACT_APP_baseServerurl + `/create/${username}/store-avatar`, avatarData)
            .then(res => {
                if(res.status){
                    setTimeout(() => {
                        navigate("/user/" + username, {state: {username: username}})
                    }, 1000)  
                }    
            })
        }
    }

    const handleRefresh = () => {
        setRefresh(!refresh)
        const images = document.getElementsByClassName("select-avatar")
        for(var image in images){
            if(images.hasOwnProperty(image)){
                images[image].classList.remove("active")
            }
        }
    }

    return(
        <div className="Credentials-container">
            <div className="Create">
                <h1>{username}</h1>
                <h4>Choose your avatar</h4>
                <div className="Profile-review" id="Profile-review">
                    <CreateAvatar></CreateAvatar>
                </div>
                <div className="refresh">
                    <svg width="30px" version="1.1" viewBox="0 0 512 512" onClick={handleRefresh} xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path d="M256,48C141.1,48,48,141.1,48,256s93.1,208,208,208c114.9,0,208-93.1,208-208S370.9,48,256,48z M256,384.1   c-70.7,0-128-57.3-128-128.1c0-70.8,57.3-128.1,128-128.1V84l96,64l-96,55.7v-55.8c-59.6,0-108.1,48.5-108.1,108.1   c0,59.6,48.5,108.1,108.1,108.1S364.1,316,364.1,256H384C384,327,326.7,384.1,256,384.1z"/>
                        </g>
                    </svg>
                </div>
                <div className="Create-btnc">
                        <div className="popup-bg">
                            <button id="Create-btn" onClick={handleClick}><span id="Text-gradient">Create Profile</span></button>
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default SelectProfilepic;