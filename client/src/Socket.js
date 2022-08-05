import { io } from "socket.io-client";

const end = "https://blaa-app.herokuapp.com"
// const end = "http://localhost:3001"

export default io(end)