import React, { useState, useRef } from "react";
import axios from "axios";
import "./styles/Reply.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";

function ReplyContainer(props) {
  const token = {
    authorization: localStorage.getItem("token"),
  };
  const [Content, setContent] = useState("");
  const reply = useRef(null)
  const onClose = () => {
    reply.current.style.animation = "slide-out 500ms ease"
    setTimeout(() => {
      props.reply[1]({})
    }, 400)
  }
  const handleChange = (e) => {
    const { value } = e.target;

    setContent(value);
  };

  const handleClick = () => {
    if (Content.length > 0) {
      const data = {
        Username: props.CurrUser,
        Content: Content,
        commentId: props.reply[0].id,
      };

      axios
        .post(
          process.env.REACT_APP_baseServerurl + `/user/:username/store/reply`,
          data,
          { headers: token }
        )
        .then((res) => {
          if (res.status) props.replyState({ reply: false });
        });
    }
  };
  return (
    <div className="Reply-container" ref={reply}>
      <label>
        <textarea placeholder="YadaYada.." value={Content} onChange={handleChange}></textarea>
        <div className="reply-btn-container">
          <p onClick={onClose}>Cancel</p>
          <button className="reply-btn" onClick={handleClick}>
            <FontAwesomeIcon icon={faReply}></FontAwesomeIcon>
          </button>
        </div>
      </label>
    </div>
  );
}

export default ReplyContainer;
