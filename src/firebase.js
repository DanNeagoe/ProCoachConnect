import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAA4tN2H6vEGWTaVyyf8rbb6XUi7paU1pw",
  databaseURL: "https://procoachconnect-92db3-default-rtdb.firebaseio.com",
  authDomain: "procoachconnect-92db3.firebaseapp.com",
  projectId: "procoachconnect-92db3",
  storageBucket: "procoachconnect-92db3.appspot.com",
  messagingSenderId: "1067171010956",
  appId: "1:1067171010956:web:8885b3cdf0d31affca1ea9"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);