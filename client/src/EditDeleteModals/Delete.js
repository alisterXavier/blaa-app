import React, { Profiler, useReducer, useRef, useState } from "react";
import './styles/Delete.css'
import axios from "axios";
import { NotificationManager } from 'react-notifications';

const token = {
    authorization: localStorage.getItem("token"),
  };

function Delete(props) {
    const Delete = () => {
        const data = {
            id : props.DeleteModal[0].id,
            commentId: props.DeleteModal[0].commentId
        }
        axios.post(`${process.env.REACT_APP_baseServerurl}/user/${props.DeleteModal[2]}/delete/${props.DeleteModal[0].type}`, data, {headers: token})
        .then(res => {
            if(res.status){
                props.DeleteModal[3]({})
                props.DeleteModal[4]({})
                if(props.DeleteModal[0].type === "reply")
                    NotificationManager.success("Reply Deleted Successfully!")
                else
                    NotificationManager.success("Post Deleted Successfully!")
                props.DeleteModal[1](false)
            }
        })
    }
    return(
        <div className="Delete-confirmation">
            <p>Confirm Delete ?</p>
            <span>
                <button className="Accept" onClick={Delete}>Yes</button>
                <button className="Reject" onClick={() => {props.DeleteModal[1](false)}}>No</button>
                {/* <button className="Reject">No</button> */}
            </span>
        </div>
    )
}

export default Delete;