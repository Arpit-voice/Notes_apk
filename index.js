const express = require("express");
const jwt = require("jsonwebtoken")
const{ authMiddleware } = require("./middlewares")

const app = express();

app.use(express.json())

const path = require("path");
app.use(express.static("frontend"));  ////css file also came 

let id =1;
let user_id =1;
let notes = [
    // {
    //     id : 1,
    //     note :"go to gym"
    //     user_id: 
    // },{
    //     id :2,
    //     note: "eat dinner"
    //     user_id :
    // }
] // this is bad (in memory db-storing in a variable like this), later we will use mongodb,postgres and mysql for storing databases
// for multi users notes structure will change to array of objects instead of string
// const notes = [{username :"Arpit",note :"go to bed"}]
const users = [
// {
//     user_id= 1
//     username : "Arpit",
//     password : "123123"
// },{
//     user_id = 2
//     username : "Soni",
//     password : "321321"
// }
]


// signup page 
app.post("/signup",(req,res)=>{
    const newUsername = req.body.username;
    const userPassword = req.body.password;

    const userExist = users.find(user => user.username == newUsername )
    if(userExist){
        return res.status(403).json({
            msg : "User with this username already exists"
        })
    }

    users.push({
        user_id : user_id++,
        username : newUsername,
        password : userPassword

    })

    res.json({
        msg : "You have signed up"
    })
})

//signin page 
// :( signin is a post method:) get req have no body
app.post("/signin",(req,res)=>{
    const givenUsername = req.body.username;
    const givenPassword = req.body.password;

    const userExist = users.find(user => user.username === givenUsername && user.password === givenPassword  )
    if(!userExist){
        res.status(403).json({
            msg : "Incorrect Credentials"
        })
        return 
    }

    // lets say user exist /// now server backend person will create some token(string) with their encryption method 
    // and return the token to the browser
    // now onwards the browser will send me this token as a request in header  
    // use the protocol of json web tokens(stateless)
    const token = jwt.sign({
        user_id : userExist.user_id
    }, "secretkey") 
    // only backend developer of the website know

    res.json({
        token : token
    })
    
})



//create a note //client give the note in json body 
//AUTHENTICATED END POINT 
app.post("/notes",authMiddleware ,(req,res)=>{
    const ourUser_id = req.user_id;

    const new_note= req.body.note;
    // stored the note that came from the client
    notes.push({
        id : id++,
        note:new_note,
        user_id:ourUser_id}); 
    // lets send user a msg :)
    
    res.json({
        msg:"Done!"
    })


})


//get all my notes -- AUTHENTICATED END POINT 
app.get("/notes",authMiddleware ,(req,res)=>{
    const ourUser_id = req.user_id;
    const userNotes = notes.filter(note => note.user_id === ourUser_id)
    res.json({
        notes : userNotes
    })
})

app.delete("/notes/:todo_id",authMiddleware, (req,res)=>{
    const ourUser_id = req.user_id;
    const id = parseInt(req.params.todo_id);

    const doesUserOwnTodo = notes.find(note => note.user_id===ourUser_id && note.id===id);

    if(!doesUserOwnTodo) {
        res.status(411).json({
            msg : "either todo does not exist or this is not your todo"
        })
        return 
    }

    notes = notes.filter(note=> note.id !== id)
    res.json({
            message: "Deleted"
        })

})


//***IMPORTANT 
// above all were backend end point 
// but this time we are writing for frontend end point beacuse we are both-frontend and backend developer 
// UN-AUTHENTICATED END POINT
app.get("/",(req,res)=>{
    res.sendFile("/home/arpit/classes_webDevelopment/notes_apk/frontend/index.html")
})
app.get("/signup",(req,res)=>{
    res.sendFile("/home/arpit/classes_webDevelopment/notes_apk/frontend/signup.html")
})
app.get("/signin",(req,res)=>{
    res.sendFile("/home/arpit/classes_webDevelopment/notes_apk/frontend/signin.html")
})

app.listen(3000,()=> {
    console.log("The Server is running properly")
})