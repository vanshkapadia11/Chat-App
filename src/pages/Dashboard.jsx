import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../utils/firestoreFunctions";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addContact, setAddContact] = useState("");
  const [isContactValid, setIsContactValid] = useState(null);
  const handleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 sec
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const AddContact = async () => {
    console.log(addContact);
    if (addContact === "") return;

    const users = await getUserData();

    const userExists = users.some((user) => user.id === addContact); /// Bhai Chutiye Kitna Chapega Be!! ---> Bhai kabhi Kabhi Hover Karke Bhi Dekh Liye Kar!!
    setIsContactValid(userExists);

    if (userExists) {
      console.log("✅ User ID is valid:", addContact);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 10000);
      // TODO: Add logic to actually add this contact
    } else {
      console.log("❌ Invalid user ID");
    }
  };
  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          {/* Modal with transition */}
          <div
            className={`bg-white p-6 rounded-xl shadow-xl w-80 transform transition-all duration-300 scale-95 opacity-0 animate-fadeIn`}
          >
            <h2 className="text-lg font-semibold mb-2 uppercase text-green-700">
              Friend Request Send!!
            </h2>
            <p className="text-sm mb-4 uppercase font-semibold">
              If Approved By User The Contact Will Be Seen In You Contacts
              Section!!
            </p>
            <button
              type="submit"
              className="md:w-1/2 w-9/12 justify-self-start py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all flex items-center justify-center gap-2 "
              onClick={() => {
                setShowPopup(false);
              }}
            >
              <span className="material-symbols-rounded text-red-500">
                close
              </span>
              Close{" "}
            </button>
          </div>
        </div>
      )}
      <Navbar />
      <section className="container">
        <div className="flex flex-col justify-between">
          <div className="mt-8 mb-10">
            <h2 className="flex items-center uppercase text-sm font-semibold gap-2 mb-4">
              <span className="material-symbols-rounded text-green-600">
                crown
              </span>
              Welcome, {user.displayName}
            </h2>
            <h2 className="flex items-center uppercase text-sm font-semibold gap-2 flex-wrap mb-4">
              <span className="material-symbols-rounded text-green-600">
                barcode_scanner
              </span>
              sir, your id is{" "}
              <span className="lowercase p-2 bg-[#f9f9f9] rounded-lg ring-1 ring-inset ring-[#e8e8e8]">
                {user.uid}
              </span>
            </h2>
            <button
              type="submit"
              className="md:w-1/2 w-9/12 justify-self-start py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all flex items-center justify-center gap-2"
              onClick={() => handleCopy(user.uid)}
            >
              {copied ? "Copied!" : "Copy your id"}
              <span className="material-symbols-rounded text-green-500">
                {copied ? "done_all" : "copy_all"}
              </span>
            </button>
          </div>
          <div className="flex justify-center items-center mt-5 flex-col">
            <div className="border-b-2 border-dashed border-b-zinc-500 heading1">
              <h2 className="text-2xl pb-6 text-center font-semibold uppercase heading1">
                Online Chat App!!
              </h2>
            </div>
            <div className="w-full">
              <h2 className="text-xl font-semibold uppercase mt-10 mb-2">
                contacts
              </h2>
              <p className="text-sm font-semibold uppercase mb-2">
                see all your contact's in one place!!
              </p>
            </div>
            <div className="w-full my-10">
              <h2 className="text-xl font-semibold uppercase mt-10 mb-2">
                add new contact
              </h2>
              <p className="text-sm font-semibold uppercase mb-2">
                add new contact by adding the id of the user!!
              </p>
              <input
                type="text"
                className="md:w-1/2 w-full py-3 px-4 my-6 border rounded-lg outline-none text-xs font-semibold dark:bg-[#242424] dark:ring-[#2a2a2a] ring-1 ring-[#e8e8e8] ring-inset "
                placeholder="BRO THE ID SHOULD BE VALID!!"
                onChange={(e) => setAddContact(e.target.value)}
              />
              <button
                type="submit"
                className="md:w-1/2 w-full justify-self-center py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all flex items-center justify-center gap-2"
                onClick={AddContact}
              >
                Add to your contact
                <span className="material-symbols-rounded text-blue-500">
                  group
                </span>
              </button>
            </div>
            <div className="w-full">
              <h2 className="text-xl font-semibold uppercase mt-10 mb-2">
                check all the things!!
              </h2>
              <p className="text-sm font-semibold uppercase mb-4">
                check your friend requests -- and is it approved or not!!
              </p>
              <div className="flex w-full gap-3">
                <button
                  type="submit"
                  className="md:w-1/2 w-6/12 justify-self-center py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate(`/Requests/${user.uid}`)}
                >
                  Requests
                  <span className="material-symbols-rounded text-amber-500">
                    hail
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Dashboard;
