import jwt_decode from "jwt-decode";

export const validate = (t) => {
  var decoded = false
  if(t)
    decoded = jwt_decode(t)
  return (decoded === undefined)? "Thou shall not enter" : {username: decoded.username, login: true}
}
