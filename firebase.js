import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js"

const firebaseConfig = {
    apiKey: "AIzaSyCkMClBLvqxdF8PoSNShV0powsTv7rrtUY",
    authDomain: "gestionagricolainf.firebaseapp.com",
    projectId: "gestionagricolainf",
    storageBucket: "gestionagricolainf.appspot.com",
    messagingSenderId: "342012963987",
    appId: "1:342012963987:web:7627a0e1c36dddd9b27166",
    measurementId: "G-PCJX4ZF4CD"
  };

  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app)
  export const db = getFirestore(app)