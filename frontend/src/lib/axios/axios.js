import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "https://new-chat-app-backend-yhg5.onrender.com/api",
  withCredentials: true,
});
export default axiosInstance;
