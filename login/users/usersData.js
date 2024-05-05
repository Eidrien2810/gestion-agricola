const usuarios=[
    {
        id:1,
        username:"admin",
        email:'admin@test.com',
        password:'ipcas123'
    },
    {
        id:2,
        username:"manager",
        email:'manager@test.com',
        password:'ipcas123'
    },
    {
        id:3,
        username:"informatica",
        email:'informatica@test.com',
        password:'ipcas123'
    },
]

window.sessionStorage.setItem("users",JSON.stringify(usuarios))