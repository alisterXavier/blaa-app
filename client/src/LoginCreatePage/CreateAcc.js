import React, { useState } from "react";
import axios from 'axios';
import "../styles/CreatePage.css";
import { useNavigate } from 'react-router-dom';
import SelectProfilepic from '../avatars/CreateAvatar' 

let c = 0;
let Dark = false

function CreatAccForm(props){
    const navigate = useNavigate();
    const [PassVisibility, setPassVisibility] = useState(true)
    const [WhiteSpaces, setWhiteSpaces] = useState(false)
    const [Users, setUsers] = useState()
    const [UserValidation, setUserValidation] = useState("")
    const [AccountCreation, setAccountCreation] = useState(false)
    const [Username, setUsername] = useState("")
    const Warnings = () => {
        if(WhiteSpaces === true){
            return(
                 <span id="Warning-Text">All leading and trailing whitespaces will be eliminated</span>
            )
        }
        else    
            return 
    }

    const handleChange = (e) => {
        setUsername(e.target.value)

        if((/^\s|\s$/).test(Username)){
            setWhiteSpaces(true)
        }
        else
            setWhiteSpaces(false)

        if(Username.length === 0 ){
            setUserValidation("Username not available")
        }
        else if(Users.length === 0)
            setUserValidation("Username available")
        else{
            Users.some(data => {
                console.log(data)
                if(Username === data){
                    setUserValidation("Username already exists. Please choose another Username.")
                    return true
                }
                else{
                    setUserValidation("Username available")
                    return false
                }
            })
        }
    }

    const handleClick = (e) => {
        const {id} = e.target
        const username = document.getElementById("username")
        const password = document.getElementById("password")

        if(id === "feedback" || id === "overlay" || id === "feedback-text"){
            document.getElementById("feedback").style.animation = "slideout 900ms ease";
            setTimeout(() => {setAccountCreation(false)}, 800)
        }
        else if(username.value === '' || password.value === ''){
            if(username.value === ''){
                username.placeholder = "Enter a valid Username"
                username.style.borderLeft = ".5px solid red"
                username.style.borderBottom = ".5px solid red"
                username.classList.add('warningActive')
                setTimeout(() => {
                    username.placeholder = "Username"
                    username.style.borderLeft = ".5px solid white"
                    username.style.borderBottom = ".5px solid white"
                    username.classList.remove('warningActive')
                }, 5000)
            }
            if(password.value === ''){
                password.placeholder = "Enter a valid password"
                password.style.borderLeft = ".5px solid red"
                password.style.borderBottom = ".5px solid red"
                password.classList.add('warningActive')
                setTimeout(() => {
                    password.placeholder = "Password"
                    password.style.borderLeft = ".5px solid white"
                    password.style.borderBottom = ".5px solid white"
                    password.classList.remove('warningActive')
                }, 5000)
            }
        }
    }

    const handleSubmit = () => {

        const username = document.getElementById("username")
        const password = document.getElementById("password")
        if(UserValidation.includes('available') && !UserValidation.includes("not")){
            const newUser = {
                username: username.value,
                password: password.value
            }
            axios.post(process.env.REACT_APP_baseServerurl + "/create/new-user/", newUser)
            .then(res => { 
                if(res.status === 200){
                    localStorage.setItem("token", res.data.token)
                    setAccountCreation(true)
                    setTimeout(() => {
                        props.Profilepic(true)
                        props.username(username.value)  
                    }, 2000)
                }
            })
            .catch(err => { console.log(err)})
            
        }
    }

    const handleover = () => {
        document.getElementById("Text-gradient").classList.add('active')
    }

    const handleout = () => {
        document.getElementById("Text-gradient").classList.remove('active')
    }

    const handleFeed = () => {
        if(AccountCreation === false)
            return
        else
            return(
                <div className="feedback-container" onClick={handleClick}>
                        <div id="overlay" onClick={handleClick}></div>
                        <div id="feedback" onClick={handleClick}>
                            <p>Account created successfully</p>
                        </div>
                    </div>
            )
    }

    React.useEffect(() => {  
        axios.post(process.env.REACT_APP_baseServerurl + '/create/userss')
        axios.get(process.env.REACT_APP_baseServerurl + '/create/get-users')
          .then(res => {
            let existingUsers = [];
            for(const key in res.data)
                if(res.data.hasOwnProperty(key)){
                    existingUsers.push(res.data[key]['username'])
                }
            setUsers(existingUsers)
          })
          .catch(err => console.log(err))
        }, []);

    return(
        <div className="Not-needed">
            <div className="Create">
                <h1>Create Account</h1>
                <div className="field-info">
                    <p>Username:</p>
                    {Warnings()}
                </div>
                <input type="text" id="username" placeholder="Username" value={Username} onChange={handleChange} autoComplete="off"></input>
                <p style={{color: "white", "fontSize": "10px", "height": "15px", "textShadow": "0px 0px 5px black"}}>{UserValidation}</p>
                <p>Password:</p>
                <div className="password-container">
                    <input type={(PassVisibility)? "password" : "text"} id="password" placeholder="Password" autoComplete="off"></input>
                    {(PassVisibility)?
                        <svg className="toggleVis" version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"onClick={() => {setPassVisibility(!PassVisibility)}}>
                            <g>
                            <path d="M8.10869891,20.8913011 C4.61720816,18.8301147 3,16 3,16 C3,16 7,9 16,9 C17.3045107,9 18.5039752,9.14706466 19.6014388,9.39856122 L16.8986531,12.1013469 C16.6097885,12.0350342 16.3089856,12 16,12 C13.7908609,12 12,13.7908609 12,16 C12,16.3089856 12.0350342,16.6097885 12.1013469,16.8986531 L8.10869891,20.8913011 L8.10869891,20.8913011 L8.10869891,20.8913011 Z M12.398561,22.601439 C13.4960246,22.8529356 14.6954892,23.0000001 16,23 C25,22.999999 29,16 29,16 C29,16 27.3827918,13.1698856 23.8913008,11.1086992 L19.8986531,15.1013469 C19.9649658,15.3902115 20,15.6910144 20,16 C20,18.2091391 18.2091391,20 16,20 C15.6910144,20 15.3902115,19.9649658 15.1013469,19.8986531 L12.398561,22.601439 L12.398561,22.601439 L12.398561,22.601439 Z M19,16 C19.0000001,16.7677669 18.7071068,17.5355339 18.1213203,18.1213203 C17.5355339,18.7071068 16.7677669,19.0000001 16,19 L19,16 L19,16 L19,16 Z M16,13 C15.2322331,12.9999999 14.4644661,13.2928932 13.8786797,13.8786797 C13.2928932,14.4644661 12.9999999,15.2322331 13,16 L16,13 L16,13 L16,13 Z M24,7 L7,24 L8,25 L25,8 L24,7 L24,7 Z" id="eye-hidden"/>
                            </g>
                        </svg>
                        :
                        <svg className="toggleVis" version="1.1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" onClick={() => {setPassVisibility(!PassVisibility)}}>
                            <g>
                            <path d="M447.1,256.2C401.8,204,339.2,144,256,144c-33.6,0-64.4,9.5-96.9,29.8C131.7,191,103.6,215.2,65,255l-1,1l6.7,6.9   C125.8,319.3,173.4,368,256,368c36.5,0,71.9-11.9,108.2-36.4c30.9-20.9,57.2-47.4,78.3-68.8l5.5-5.5L447.1,256.2z M256,336   c-44.1,0-80-35.9-80-80c0-44.1,35.9-80,80-80c44.1,0,80,35.9,80,80C336,300.1,300.1,336,256,336z"/>
                            <path d="M250.4,226.8c0-6.9,2-13.4,5.5-18.8c-26.5,0-47.9,21.6-47.9,48.2c0,26.6,21.5,48.1,47.9,48.1s48-21.5,48-48.1v0   c-5.4,3.5-11.9,5.5-18.8,5.5C266,261.6,250.4,246,250.4,226.8z"/>
                            </g>
                        </svg>
                    }
                </div>
                <p>Email: (optional)</p>
                <input type="text" id="email" placeholder="E-mail" autoComplete="off"></input>
                <div className="Create-btnc">
                    <div className="popup-bg">
                        <button id="Create-btn"  onMouseOver={handleover} onMouseOut={handleout} onClick={handleSubmit}><span id="Text-gradient">Create Account</span></button>
                    </div>
                </div>
            </div>
            {handleFeed()}
        </div>
    )
}

function Create(){
    const [Profilepic, setProfilepic] = useState(false)   
    const [Username, setUsername] = useState("")

    const DarkOrLight = () => {
        
        const container = document.getElementsByClassName('Credentials-container')[0]
        c +=1;
        
        if(Profilepic){
            const create = document.getElementsByClassName('Create')[0]
            const createChildren = create.getElementsByTagName('input')
            if(Dark){
                document.getElementsByClassName("popup-bg")[0].style.backgroundColor = "#40e0d08c"
                create.style.color  = 'white'
                for(const key in create.getElementsByTagName('input'))
                    if(create.hasOwnProperty(key))
                    createChildren[key].style.color = 'white'
            }
            else{
                document.getElementsByClassName("popup-bg")[0].style.backgroundColor = 'black'
                create.style.color  = 'black'
                for(const key in createChildren)
                    if(create.hasOwnProperty(key))
                    createChildren[key].style.color = 'black'
                }
        }
        else{
            const input = document.querySelector("input[type=file]"); 
            if(Dark){
                input.style.color = "white"
            }
            else
                input.style.color = "black"
        }
            const backgroundPos = 100 / 3 * 2 * c
            container.style.backgroundPosition = `${backgroundPos}%`;
    }

    const toggleDark = () => {
        Dark = !Dark
        DarkOrLight()
    }

    const setPic = () =>{
        window.location.assign(process.env.REACT_APP_baseServerurl + `/create/${Username}/avatar`)
    }
    
  return(
      <div className="Credentials-container">
          <div className="toggle-container">
                <input className="toggle" id="modeToggle" type="checkbox" onClick={toggleDark}></input>
            </div>
            {(Profilepic)? setPic() : <CreatAccForm Profilepic={setProfilepic} username={setUsername}></CreatAccForm>}
      </div>
  )
}

export default Create;