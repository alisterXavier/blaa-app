import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { validate } from "./token";
import { initializeApp } from "firebase/app";
import { ref, uploadBytes, getStorage, getDownloadURL } from "firebase/storage";
var parse = require("html-react-parser");


const firebaseConfig = {
  apiKey: "AIzaSyA81HDJZJc7-zQbges_Y2IJfiECyf8-hCI",
  authDomain: "imagessocialmedia-dc79a.firebaseapp.com",
  projectId: "imagessocialmedia-dc79a",
  storageBucket: "imagessocialmedia-dc79a.appspot.com",
  messagingSenderId: "553198894556",
  appId: "1:553198894556:web:549cfeeed846e524176319",
  measurementId: "G-JSKJST78J2",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

//
export const UploadImg = async (img, CurrUser) => {
  let url;
  if (img === null || img === undefined) return;
  const imgRef = ref(storage, `images/${img.name}` + CurrUser);
  await uploadBytes(imgRef, img);
  url = await getDownloadURL(imgRef);

  return url;
};

export const check_content = (content) => {
  content = content.split(" ");
  let tag = "<p>";
  const user = /@\w*/;
  const url = /(https?:\/\/[^\s]+)/;
  content.map((word) => {
    if (word.match(user))
      tag += ` <span className="taggedUser">${word.substring(1)}</span> `;
    else if (word.match(url)) {
      tag += `<a className="re-url" href=${word}>${word}</a>`;
    } else tag += " " + word;
  });
  tag += "</p>";

  return parse(`<div>${tag}</div>`);
};

//
export const userName = (user, CurrUser,navigate) => {
  return (
    <p
      className="username"
      id="username"
      onClick={() => {
        navigate(`/user/${CurrUser}/profile`, { state: { username: user } });
      }}
    >
      {user}
    </p>
  );
};

export const onLike =  async(id, datas, headers) => {

  let CurrUser = validate(headers.headers.authorization)
  if (datas.includes(CurrUser)) return;
  
  await axios.post(
    process.env.REACT_APP_baseServerurl + `/user/${CurrUser}/like/${id}`,
    {},
    headers 
  );
};

export const onDislike = (id, datas, headers) => {
  let CurrUser = validate(headers.headers.authorization)
  if (!datas.includes(CurrUser)) return;
  
  axios.post(
    process.env.REACT_APP_baseServerurl + `/user/${CurrUser}/dislike/${id}`,
    {},
    headers
  );
};

export const debounce = (fn, delay) => {
  var timeout;

  return (...args) => {
    if(timeout){
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {fn(...args)}, delay)
  }
}

export default function Nothing() {
  return (
    <div className="NothingContainer">
      <p className="nothing">Nothing</p>
      <p className="nothing">Nothing</p>
      <p className="nothing">Nothing</p>
      <p className="nothing">Nothing</p>
      <p className="nothing">Nothing</p>
    </div>
  );
}
