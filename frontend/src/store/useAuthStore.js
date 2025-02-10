import { create } from "zustand";
import axiosInstance from "../lib/axios/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL = "http://localhost:5000";
export const useAuthStore = create((set, get) => ({
  onlineUsers: [],
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  socket: null,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        withCredentials: true,
      });

      set({ authUser: res.data, isCheckingAuth: true });
      get().connectSocket();
    } catch (err) {
      console.log("Error in checkAuthStore controller : ", err.message);
      // toast.error(err.message || "Something went wrong");
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    try {
      set({ isSigningUp: true });
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (err) {
      toast.error(err.response.data.message || "Something went wrong");
      console.log(
        "Error in signupStore controller : ",
        err.response.data.message
      );
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (formData) => {
    try {
      set({ isLoggingIn: true });
      const res = await axiosInstance.post("/auth/login", formData);
      set({ authUser: res.data });
      toast.success("Login successful");
      get().connectSocket();
    } catch (err) {
      console.log("Error in loginStore controller : ", err.message);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.get("/auth/logout", { withCredentials: true }); // Ensure cookies are included
      set({ authUser: null });
      toast.success("Logout successful");
      get().disconnectSocket();
    } catch (err) {
      console.error("Error in logoutStore controller:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  },
  updateProfile: async (data) => {
    try {
      set({ isUpdatingProfile: true });
      const res = axiosInstance.put("/auth/update-profile", data, {
        withCredentials: true,
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      console.log("Error in updateProfileStore controller : ", err.message);
      toast.error(err.message || "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: async () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: async () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },
}));
