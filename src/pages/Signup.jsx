import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth"; // ✅ for setting displayName
import { doc, setDoc } from "firebase/firestore"; // ✅ for writing to Firestore
import { db } from "../firebase"; // ✅ import Firestore instance
import Navbar from "./Navbar";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState(""); // Sets The Email
  const [password, setPassword] = useState(""); // Sets The Pass
  const [error, setError] = useState(""); // Sets The Error
  const [name, setName] = useState(""); // Sets The Name
  const navigate = useNavigate(); // Sets The Navigate Thingy!!
  const { user } = useAuth(); // Gets The User!!

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // 1. Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const createdUser = userCredential.user;
      // console.log(userCredential); // Just For Development!!

      // 2. ✅ Update profile AFTER user is created
      await updateProfile(createdUser, {
        displayName: name,
        // photoURL: "", // This Is Optional One Can Also Not Do It!!
      });
      await createdUser.reload(); // ⬅️ this forces Firebase to re-fetch the latest profile
      // console.log("Display Name:", user.displayName); // Just For Devlopment!!
      // navigate("/dashboard"); // FIXME: This Was Creating The Issue With The Navbar!!

      // 3. ✅ Save to Firestore
      await setDoc(doc(db, "todoUsers", createdUser.uid), {
        uid: createdUser.uid,
        name: name,
        email: createdUser.email,
        createdAt: new Date(),
      });

      console.log("Signup successful!");
    } catch (error) {
      // console.error("Signup failed:", error.message); // you can keep or remove this in dev

      // Extract Firebase-friendly error messages
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        default:
          setError("Signup failed. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="mt-20 justify-self-center container md:w-9/12">
        <form onSubmit={handleSignup} className="flex flex-col rounded-lg">
          <h2 className="text-2xl font-bold text-zinc-800 mb-6 text-center heading1 uppercase">
            Sign Up
          </h2>

          {error && (
            <p className="text-red-400 text-sm mb-4 font-semibold uppercase">
              {error}
            </p>
          )}

          <label
            htmlFor="name"
            className="text-xs font-semibold mb-2 uppercase"
          >
            Enter Your Name
          </label>
          <input
            type="text"
            placeholder=""
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-4 border rounded outline-none text-sm font-semibold dark:bg-[#242424] dark:ring-[#2a2a2a] ring-1 ring-[#e8e8e8] ring-inset "
          />
          <label
            htmlFor="email"
            className="text-xs font-semibold mb-2 uppercase"
          >
            Enter Your email
          </label>
          <input
            type="email"
            placeholder=""
            value={email}
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded outline-none text-sm font-semibold dark:bg-[#242424] dark:ring-[#2a2a2a] ring-1 ring-[#e8e8e8] ring-inset "
            required
          />
          <label
            htmlFor="password"
            className="text-xs font-semibold mb-2 uppercase"
          >
            Enter Your password
          </label>
          <input
            type="password"
            placeholder=""
            value={password}
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border rounded outline-none text-sm font-semibold dark:bg-[#242424] dark:ring-[#2a2a2a] ring-1 ring-[#e8e8e8] ring-inset "
            required
          />
          <button
            type="submit"
            className="w-1/2 justify-self-center py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-10 flex justify-center items-center flex-col">
          <h2 className="font-semibold text-lg uppercase mb-5">OR</h2>
          <button
            type="submit"
            className="w-1/2 justify-self-center py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all"
            onClick={() => navigate("/login")}
          >
            login
          </button>
        </div>
      </div>
    </>
  );
};

export default Signup;
