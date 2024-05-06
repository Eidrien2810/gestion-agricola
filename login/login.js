import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "../firebase.js";

const login = document.querySelector("#formSingIn")
login.addEventListener('submit',async(e)=>{
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    console.log(email,password)
    try {
        const userAuth= await signInWithEmailAndPassword(auth,email,password);
        window.location.replace("../index.html")
    } catch (error) {
        if (error.code === 'auth/invalid-login-credentials') {
          alert("email o contraseña incorrecta")
        }else {
          alert("Algo salio mal")
        }
        login.reset()
    }  
})

