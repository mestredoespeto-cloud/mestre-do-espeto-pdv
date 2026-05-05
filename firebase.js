import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "mestre-do-espeto-pdv.firebaseapp.com",
  projectId: "mestre-do-espeto-pdv",
  storageBucket: "mestre-do-espeto-pdv.firebasestorage.app",
  messagingSenderId: "699433703138",
  appId: "1:699433703138:web:a1835a708e2e181f6f0bb"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);