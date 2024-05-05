
const users= JSON.parse(window.sessionStorage.getItem("users"))

document.getElementById("formSubmit").addEventListener('click',function(e){
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const validateUser = users.find(user=>{
        if(user.email==email && user.password==password)return true
        return false
    })

    if(validateUser){
        const user = users.find(user=>user.email==email && user.password==password)
        console.log(user)
        window.sessionStorage.setItem("userId",user.id)
        window.location.replace("../index.html")
    }else{
        alert("email o contraseña incorrecta")
    }
    
})

