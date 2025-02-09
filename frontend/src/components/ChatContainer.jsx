import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { formatMessageTime } from "../lib/utils/formateMessageTime";
import { useAuthStore } from "../store/useAuthStore";
import NoMessages from "./NoMessage";

const ChatContainer = () => {
  const {
    messages,
    getMessage,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessage(selectedUser._id);
      subscribeToMessages();
      return () => {
        unsubscribeFromMessages();
      };
    }
  }, [
    selectedUser?._id,
    getMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 ? (
          <NoMessages />
        ) : (
          messages?.map((message) => {
            const isAuthUser = message?.senderId === authUser?._id;
            return (
              <div
                key={message?._id}
                className={`chat ${isAuthUser ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        isAuthUser
                          ? authUser?.profilePic || "/avatar.png"
                          : selectedUser?.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message?.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message?.image && (
                    <img
                      src={message?.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                      loading="lazy"
                    />
                  )}
                  {message?.text && <p>{message?.text}</p>}
                </div>
              </div>
            );
          })
        )}
        {/* Ensure smooth scrolling to the last message */}
        <div ref={messageEndRef}></div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
