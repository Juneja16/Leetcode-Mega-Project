import axios from "axios";

// baseURl is set here hence while making API Request through Axios we
// just have to write the API Endpoint

// withCredentials: true
// iF Backend use HTTP Tokens/cookies then axios should also send that
// cookies/tokens to server

/* // headers: {
    "Content-Type": "application/json",
  }, 
  Hey i will be sending the JSON Data always 
  */

const axiosClient = axios.create({
  baseURL: "http://localhost:7046",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
