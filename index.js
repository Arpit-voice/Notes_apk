const express = require("express");
const jwt = require("jsonwebtoken")
const{ authMiddleware } = require("./middlewares")
const {Pool} = require("pg")

const pool= new Pool({
    connectionString : "postgresql://neondb_owner:npg_BniQ96PuJcIb@ep-rough-math-ap0c7osc-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})

const app = express();

app.use(express.json())

app.use(express.static("frontend"));  ////css file also came 


// signup page 
app.post("/signup",async (req,res)=>{
    const newUsername = req.body.username;
    const userPassword = req.body.password;

    // const userExist = await usermodel.findOne({
    //     username : newUsername,
    //     password : userPassword
    // })

    // if(userExist){
    //     return res.status(403).json({
    //         msg : "User with this username already exists"
    //     })
    // }

    /// query = INSERT INTO users (username , password) VALUES ('newUsername','userPassword');
    ///A VERY BAD WAY TO DO SQL USING PG -- THIS IS ALSO VULNARABLE TO SQL INJECTION  //
    let query = `INSERT INTO users (username , password) VALUES ('${newUsername}',' ${userPassword} ');`
    console.log(query)
    const response = await pool.query(query)
    console.log(response)     //// will not get any id sadd

    res.json({
        // id : newUser._id,    /////._id is an object while .id is string///infact database me to _id hi hota hai key to
        msg : "You have signed up"
    })
})

//signin page 
// :( signin is a post method:) get req have no body
app.post("/signin",async (req,res)=>{
    const givenUsername = req.body.username;
    const givenPassword = req.body.password;
    
    const userExist =await usermodel.findOne({
        username : givenUsername,
        password : givenPassword
    })
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
        user_id : userExist.id
    }, "secretkey") 
    // only backend developer of the website know

    res.json({
        token : token
    })
    
})



//create a note //client give the note in json body 
//AUTHENTICATED END POINT 
app.post("/notes",authMiddleware ,async(req,res)=>{
    const ourUser_id = req.user_id;

    const new_note= req.body.note;
    // stored the note that came from the client
    const newNote = await notemodel.create({
        note : new_note,
        user_id : ourUser_id
    })
       
    res.json({
        msg:"Done!",
        _id : newNote._id
    })


})


//get all my notes -- AUTHENTICATED END POINT 
app.get("/notes",authMiddleware ,async (req,res)=>{
    const ourUser_id = req.user_id;
    // const userNotes = notes.filter(note => note.user_id === ourUser_id)
    const userNotes =await notemodel.find({
        user_id : ourUser_id,
    })

    res.json({
        notes : userNotes
    })
})

app.delete("/notes/:todo_id",authMiddleware,async (req,res)=>{
    const ourUser_id = req.user_id;
    const id_tobeDeleted= req.params.todo_id;

    // const doesUserOwnTodo = notes.find(note => note.user_id===ourUser_id && note.id===id);
    const doesUserOwnTodo = await notemodel.findOne({
        _id : id_tobeDeleted,
        user_id : ourUser_id
    })

    if(!doesUserOwnTodo) {
        res.status(411).json({
            msg : "either todo does not exist or this is not your todo"
        })
        return 
    }

    // notes = notes.filter(note=> note.id !== id)
    await notemodel.deleteOne({
        _id : id_tobeDeleted,
    })
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