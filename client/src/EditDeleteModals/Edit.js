import React, { Profiler, useReducer, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./styles/Edit.css";
import axios from "axios";
import { NotificationManager } from "react-notifications";

function EditContent(props) {
  const token = {
    authorization: localStorage.getItem("token"),
  };
  const [Content, setContent] = useState();
  const edit = useRef(null);
  const handleChange = (e) => {
    const { value } = e.target;
    setContent(value);
  };

  const onClose = (e) => {
    edit.current.style.animation = "slide-out 500ms ease";
    setTimeout(() => {
      props.Edit[1]({ edit: false });
    }, 400);
  };

  const handleClick = () => {
    if (Content.length > 0) {
      console.log("ssss")
      const data = {
        id: props.Edit[0].id,
        Content: Content,
      };
      axios
        .post(
          process.env.REACT_APP_baseServerurl +
            `/user/${props.Edit[0].id}/edit`,
          data,
          { headers: token }
        )
        .then((res) => {
          if (res.status) {
            props.Edit[1]({});
            NotificationManager.success("Post Edited Successfully!");
          }
        });
    }
  };
  return (
    <div className="edit slide-in" ref={edit}>
      <label>
        <textarea
          id="content"
          placeholder="Enter Text...."
          value={Content}
          onChange={handleChange}
        ></textarea>
        <div className="edit-btn-container">
          <p onClick={onClose}>Cancel</p>
          <button id="Post-btn" onClick={handleClick}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </label>
    </div>
  );
}

export default EditContent;
