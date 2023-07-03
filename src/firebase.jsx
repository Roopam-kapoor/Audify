import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDy3NNYMY1ZLsdMH1qPQXsF7jmQXf0aPN8",
  authDomain: "audify-b44cf.firebaseapp.com",
  projectId: "audify-b44cf",
  storageBucket: "audify-b44cf.appspot.com",
  messagingSenderId: "156615621907",
  appId: "1:156615621907:web:8ac126abd95233af4eaee6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth();
const db = getFirestore(app);
export { app, auth, storage, db };
