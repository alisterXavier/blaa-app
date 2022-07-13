import React, { Profiler, useReducer, useRef, useState } from "react";
// import "./HomePage.css";
import "../styles/HomePage1.css";
import axios from "axios";
import { NotificationManager } from 'react-notifications';

const token = {
    authorization: localStorage.getItem("token"),
  };

function EditContent(props) {

    const [Content, setContent] = useState("");

    const handleChange = (e) => {
        const { value } = e.target
        setContent(value)
    }

    const onClose = (e) => {
        console.log(e)
        if(e.target.className === "edit")
        {   
            props.EditModal[1]({edit: false})}
    }

    const handleClick = () => {
        const data ={ 
            id: props.EditModal[0].id,
            Content: Content
        }
        axios.post(process.env.REACT_APP_baseServerurl + `/user/${props.EditModal[0].id}/edit`, data, { headers: token })
        .then(res => {
            if(res.status){
                NotificationManager.success("Post Edited Successfully!")
                props.EditModal[1](false)
            }
        })
    }
    return(
        <div className="edit" onClick={onClose}>
            <div className="new">
                <div>
                    <textarea
                        id="content"
                        placeholder="Enter Text...."
                        value={Content}
                        onChange={handleChange}
                    ></textarea>
                    <button id="Post-btn" onClick={handleClick}>
                        Edit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditContent;