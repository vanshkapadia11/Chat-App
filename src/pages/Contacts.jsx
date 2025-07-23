import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserDataByUid } from "../utils/firestoreFunctions";
import { useNavigate } from "react-router-dom";
import { createOrJoinChat } from "../utils/firestoreFunctions";

const Contacts = () => {
  const [friends, setFriends] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.uid) return;

      const userData = await getUserDataByUid(user.uid);
      if (!userData?.friends || userData.friends.length === 0) return;

      const friendPromises = userData.friends.map((uid) =>
        getUserDataByUid(uid)
      );
      const friendsDetails = await Promise.all(friendPromises);

      setFriends(friendsDetails);
    };

    fetchContacts();
  }, [user?.uid]);

  // Generate chatId = sorted combination
  const startChat = async (friendUid) => {
    const chatId = [user.uid, friendUid].sort().join("_");

    // Ensure chat exists before navigating
    await createOrJoinChat(chatId, user.uid, friendUid);

    navigate(`/chat/${chatId}`);
  };

  return (
    <section className="container">
      <div className="mt-5">
        {friends.length === 0 ? (
          <p className="text-sm font-semibold uppercase">
            No contacts found. ---{" "}
            <span className="text-red-400">
              Send Friend Requests To Your Friends
            </span>
          </p>
        ) : (
          friends.map((friend, index) => (
            <div
              key={index}
              className="py-4 shadow-lg rounded-lg mb-4 ring-1 ring-inset ring-[#e8e8e8] backdrop-blur-sm flex justify-between items-center px-8"
            >
              <div>
                <p className="font-semibold text-lg heading1 uppercase">
                  {friend.name || "Unknown"}
                </p>
                <p className="text-xs font-semibold">
                  {friend.email || "No email provided"}
                </p>
              </div>
              <div>
                <button onClick={() => startChat(friend.uid)}>
                  <span className="material-symbols-rounded p-2 bg-[#f9f9f9] rounded-lg shadow-lg text-green-500 backdrop-blur-sm cursor-pointer ring-1 ring-inset ring-[#e8e8e8]">
                    chat_bubble
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Contacts;
