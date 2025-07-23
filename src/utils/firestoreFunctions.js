// utils/firestoreFunctions.js
import { db } from "../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { arrayUnion, arrayRemove } from "firebase/firestore";

import { v4 as uuidv4 } from "uuid"; // For unique message IDs
// Create
export const addUserData = async (uid, data) => {
  try {
    const userRef = doc(db, "todoUsers", uid);
    await setDoc(userRef, data, { merge: true }); // ✅ creates or updates without overwrite
    console.log("✅ Todo list updated or created in Firestore.");
  } catch (error) {
    console.error("❌ Error updating Firestore:", error.message);
  }
};

// Read --> Get All The User Data In An Array!! --> Bhai Yaha Pe Jo Update Ka Code Hai Wo Tune Idhar Likh Diya Hai!!
export const getUserData = async () => {
  const usersRef = collection(db, "todoUsers");
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Update
export const updateUserData = async (id, newData) => {
  const docRef = doc(db, "todoUsers", id);
  await updateDoc(docRef, newData);
};

// Delete
export const deleteUserData = async (id) => {
  const docRef = doc(db, "todoUsers", id);
  await deleteDoc(docRef);
};

// ✅ Get a single user's data by UID
export const getUserDataByUid = async (uid) => {
  try {
    const userRef = doc(db, "todoUsers", uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      return snapshot.data(); // ✅ returns the document data
    } else {
      console.warn("User not found with UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching user data:", error.message);
    return null;
  }
};

// ✅ Create a new chat document with given users
export const createChatDocument = async (chatId, users) => {
  try {
    const chatRef = doc(db, "chats", chatId);
    await setDoc(chatRef, {
      users: users, // [uid1, uid2]
    });
    console.log("✅ Chat document created:", chatId);
  } catch (error) {
    console.error("❌ Error creating chat document:", error.message);
  }
};

// ✅ Add chatId to user's personal "chats" array
export const createOrJoinChat = async (chatId, userId, friendId) => {
  // References to each user's chat doc
  const userChatRef = doc(db, "todoUsers", userId, "chats", chatId);
  const friendChatRef = doc(db, "todoUsers", friendId, "chats", chatId);

  // Create chat metadata for both users
  await setDoc(userChatRef, {
    users: [userId, friendId],
    createdAt: serverTimestamp(),
  });

  await setDoc(friendChatRef, {
    users: [userId, friendId],
    createdAt: serverTimestamp(),
  });
};
// Send message to subcollection
export const sendMessageToChatDoc = async (chatId, senderId, text) => {
  const senderChatRef = doc(db, "todoUsers", senderId, "chats", chatId);
  const senderSnap = await getDoc(senderChatRef);

  if (!senderSnap.exists()) {
    console.error(`Chat ${chatId} not found for user ${senderId}`);
    return;
  }

  const users = senderSnap.data().users;
  console.log("Sending message to users:", users);

  for (const uid of users) {
    const messagesRef = collection(
      db,
      "todoUsers",
      uid,
      "chats",
      chatId,
      "messages"
    );
    await addDoc(messagesRef, {
      text,
      senderId,
      createdAt: serverTimestamp(),
    });
  }
};

// Listen for messages in real-time
export const listenToMessages = (chatId, userId, callback) => {
  const messagesRef = collection(
    db,
    "todoUsers",
    userId,
    "chats",
    chatId,
    "messages"
  );
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(msgs);
  });
};
