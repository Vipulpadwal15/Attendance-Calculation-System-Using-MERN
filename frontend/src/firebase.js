import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAl6W7YgsaEuRRN6OhrKTkGdVxefQ5IPQ8",
  authDomain: "attendance-manager-92d56.firebaseapp.com",
  projectId: "attendance-manager-92d56",
  storageBucket: "attendance-manager-92d56.appspot.com",
  messagingSenderId: "908252091791",
  appId: "1:908252091791:web:fc8eea911f4677ed42e7fa",
  measurementId: "G-3CH565V7H5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { db, auth, provider, doc, setDoc };
