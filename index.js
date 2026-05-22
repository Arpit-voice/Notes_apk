const express = require("express");
const jwt = require("jsonwebtoken")

const app = express();

app.use(express.json())

const path = require("path");
app.use(express.static("frontend"));  ////css file also came 

const notes = [] // this is bad (in memory db-storing in a variable like this), later we will use mongodb,postgres and mysql for storing databases
const users = [{
    username : "Arpit",
    password : "123123"
},{
    username : "Soni",
    password : "321321"
}]


// signup page 
app.post("/signup",(req,res)=>{
    const newUsername = req.body.userName;
    const userPassword = req.body.password;

    const userExist = users.find(user => user.username == newUsername )
    if(userExist){
        return res.status(403).json({
            msg : "User with this username already exists"
        })
    }

    user.push({
        username : newUsername,
        password : userPassword

    })

    res.json({
        msg : "You have signed up"
    })
})

//signin page 

app.get("/signin",(req,res)=>{
    const givenUsername = req.body.userName;
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
        username :username
    }, "secretkey") 
    // only backend developer of the website know

    res.json({
        token : token
    })
    
})



//create a note //client give the note in json body 
//AUTHENTICATED END POINT 
app.post("/notes",(req,res)=>{
    //auth things
    const given_token = req.headers.token;
    
    //if they didnt sent the token
    if(!given_token){
        res.status(403).send({
            msg : "You are not logged in"
        })
        return;
    }
    const decrypted_token = jwt.verify(token,"secretkey");
    const ourUser = decoded.username;
    // if there is no username like this
    if(!ourUser){
        res.status(403).send({
            msg : "malformed token!!"
        })
    }

    // now all correct //Authentication done

    const new_note= req.body.note;
    // stored the note that came from the client
    notes.push(new_note); 
    // lets send user a msg :)
    
    res.json({
        msg:"Done!"
    })


})


//get all my notes -- AUTHENTICATED END POINT 
app.get("/notes",(req,res)=>{
    res.json({
        notes
    })
})


//***IMPORTANT 
// above all were backend end point 
// but this time we are writing for frontend end point beacuse we are both-frontend and backend developer 
// UN-AUTHENTICATED END POINT
app.get("/",(req,res)=>{
    res.sendFile("/home/arpit/classes_webDevelopment/notes_apk/frontend/index.html")
})

app.listen(3000,()=> {
    console.log("The Server is running properly")
})