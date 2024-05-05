
const userId = window.sessionStorage.getItem("userId")

    if(userId===null){ 
        window.location.replace("./login/login.html")
    }else{
        window.location.replace("./main/main.html")
    }
