import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios/axios.js";
import { useAuthStore } from "./useAuthStore.js";
export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  onlineUsers: [],

  getUsers: async () => {
    try {
      set({ isUsersLoading: true });
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (err) {
      console.error("Error in getUsers:", err.message);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessage: async (id) => {
    if (!id) {
      toast.error("User ID not provided");
      return;
    }
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${id}`);
      console.log(res.data);
      set({ messages: res.data });
    } catch (err) {
      console.error("Error in getMessage:", err.message);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (user) => {
    if (!user || get().selectedUser?._id !== user?._id) {
      set({ selectedUser: user });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      set({ isSendingMessage: true });
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
      toast.success("Message sent successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSendingMessage: false });
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (data) => {
      if (data.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, data] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
