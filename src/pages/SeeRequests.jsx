import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addUserData, getUserDataByUid } from "../utils/firestoreFunctions";
import { arrayUnion } from "firebase/firestore";
import { arrayRemove } from "firebase/firestore";

const SeeRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requestsUsers, setRequestsUsers] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let userData = await getUserDataByUid(user.uid);

        // If no requests, return early
        if (!userData.requests || userData.requests.length === 0) {
          return;
        }

        // Fetch all requested user details in parallel
        const usersData = await Promise.all(
          userData.requests.map((id) => getUserDataByUid(id))
        );

        setRequestsUsers(usersData); // set full user objects here
      } catch (error) {
        console.log("❌ Error fetching requests", error);
      }
    };

    fetchUser();
  }, [user.uid]);

  const addToContact = async (idx) => {
    await addUserData(user.uid, {
      friends: arrayUnion(idx),
      requests: arrayRemove(idx), // 👈 remove from requests
    });
    navigate("/dashboard");
  };

  return (
    <section className="container">
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

      <div className="mt-16">
        <h2 className="text-2xl font-semibold uppercase heading1">
          You got requests from:
        </h2>
        <div className="mt-5 space-y-3">
          {requestsUsers.length > 0 ? (
            requestsUsers.map((user, idx) => (
              <div
                key={idx}
                className="p-6 border rounded-md shadow-md ring-1 ring-inset ring-[#e8e8e8] flex flex-col"
              >
                <div className="">
                  <h3 className="text-xl font-semibold uppercase heading1 mb-2">
                    {user.name || "Unknown"}
                  </h3>
                  <p className="text-xs text-zinc-700 uppercase font-semibold mb-6">
                    {user.email}
                  </p>
                </div>
                <button
                  className="md:w-3/12 w-full py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all flex items-center justify-center gap-2"
                  onClick={() => addToContact(requestsUsers[idx].uid)}
                >
                  Approve
                  <span className="material-symbols-rounded text-green-400">
                    taunt
                  </span>
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No requests yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SeeRequests;
