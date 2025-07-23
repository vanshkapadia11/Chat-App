import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createOrJoinChat,
  sendMessageToChatDoc,
  listenToMessages,
  getUserDataByUid,
} from "../utils/firestoreFunctions";

import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Chats = () => {
  const { ChatID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [otherUserName, setOtherUserName] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchOtherUserName = async () => {
      if (!ChatID || !user) return;

      try {
        // Get chat doc from current user's path
        const chatRef = doc(db, "todoUsers", user.uid, "chats", ChatID);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          const chatData = chatSnap.data();
          const otherUid = chatData.users.find((uid) => uid !== user.uid);

          if (otherUid) {
            const data = await getUserDataByUid(otherUid);
            setOtherUserName(data?.name || "Unknown User");
          }
        }
      } catch (err) {
        console.error("Error fetching other user:", err);
      }
    };

    fetchOtherUserName();

    // Listen to messages from the current user's path
    if (!ChatID || !user) return;
    const unsub = listenToMessages(ChatID, user.uid, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [ChatID, user]);

  const handleSend = async () => {
    if (message.trim()) {
      await sendMessageToChatDoc(ChatID, user.uid, message);
      setMessage("");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(ChatID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ChatID) {
    return <p className="text-center mt-10">Loading chat...</p>;
  }

  return (
    <>
      <Navbar />
      <section className="container px-4">
        <div className="mt-10">
          <button
            onClick={() => navigate(-1)}
            className="md:w-3/12 w-1/2 mt-5 py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all flex items-center justify-center gap-2"
          >
            Back
            <span className="material-symbols-rounded text-red-400">
              arrow_back
            </span>
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <h2 className="flex items-center uppercase text-sm font-semibold gap-2 flex-wrap mb-4">
            <span className="material-symbols-rounded text-green-600">
              barcode_scanner
            </span>
            hey, your chat id is{" "}
            <span className="lowercase p-2 bg-[#f9f9f9] rounded-lg ring-1 ring-inset ring-[#e8e8e8]">
              {ChatID}
            </span>
          </h2>
          <button
            onClick={handleCopy}
            className="md:w-1/2 w-9/12 py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all flex items-center justify-center gap-2"
          >
            {copied ? "Copied!" : "Copy your chat id"}
            <span className="material-symbols-rounded text-green-500">
              {copied ? "done_all" : "copy_all"}
            </span>
          </button>
        </div>

        <div className="my-6 max-h-[400px] overflow-y-auto space-y-2 flex flex-col justify-between">
          <h2 className="mt-10 mb-6 text-lg font-semibold uppercase heading1">
            {otherUserName}
          </h2>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[70%] p-3 rounded-lg text-sm font-semibold ${
                msg.senderId === user.uid
                  ? "bg-blue-100 self-end ml-auto"
                  : "bg-gray-200 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2 items-center">
          <input
            type="text"
            className="w-full py-3 px-4 my-6 border rounded-lg outline-none text-xs font-semibold dark:bg-[#242424] dark:ring-[#2a2a2a] ring-1 ring-[#e8e8e8] ring-inset "
            placeholder="Start typing your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="md:w-1/2 w-1/2 justify-self-center py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all flex items-center justify-center gap-2"
            onClick={handleSend}
          >
            send
            <span className="material-symbols-rounded text-blue-500">
              delivery_truck_bolt
            </span>
          </button>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Chats;
