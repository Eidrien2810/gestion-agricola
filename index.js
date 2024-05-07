import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth } from "../firebase.js";


onAuthStateChanged(auth,async(user)=>{
    if(user){
        window.location.replace("./main/main.html")
    }else{
        window.location.replace("./login/login.html")
    }
})

// const userId = window.sessionStorage.getItem("userId")

//     if(userId===null){ 
//         window.location.replace("./login/login.html")
//     }else{
//         window.location.replace("./main/main.html")
//     }
