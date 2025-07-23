import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserDataByUid } from "../utils/firestoreFunctions";

const Contacts = () => {
  const [friendData, setFriendData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContacts = async () => {
      console.log("Fetching contacts...");
      const contacts = await getUserDataByUid(user.uid);

      if (!contacts?.friends || contacts.friends.length === 0) {
        console.log("No contacts found for user:", user.uid);
        return;
      }

      // Step 1: get all friends UIDs
      const friendUids = contacts.friends;

      // Step 2: fetch each friend's data by UID
      const friendPromises = friendUids.map((uid) => getUserDataByUid(uid));
      const friendsDetails = await Promise.all(friendPromises);

      setFriendData(friendsDetails);
      console.log("Contacts fetched:", friendsDetails);
    };

    fetchContacts();
  }, [user.uid]);

  return (
    <section className="container">
      <div className="mt-5">
        {friendData.length === 0 ? (
          <p className="text-sm font-semibold uppercase">
            No contacts found. ---{" "}
            <span className="text-red-400">
              Send Friend Requests To Your Friends
            </span>
          </p>
        ) : (
          friendData.map((friend, index) => (
            <div
              key={index}
              className="py-4 shadow-lg rounded-lg mb-4 ring-1 ring-inset ring-[#e8e8e8] backdrop-blur-sm flex justify-between items-center px-8"
            >
              <div className="">
                <p className="font-semibold text-lg heading1 uppercase">
                  {friend.name || "Unknown"}
                </p>
                <p className="text-xs font-semibold">
                  {friend.email || "No email provided"}
                </p>
              </div>
              <div className="">
                <button>
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
