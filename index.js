const express = require("express");

const app = express();

app.use(express.json())

const path = require("path");
app.use(express.static("frontend"));  ////css file also came 

const notes = [{"msg" :"aaj ka khana"}] // this is bad (in memory db-storing in a variable like this), later we will use mongodb,postgres and mysql for storing databases

//create a note //client give the note in json body 
app.post("/notes",(req,res)=>{
    const new_note= req.body.note;
    // stored the note that came from the client
    notes.push(new_note); 
    // lets send user a msg :)
    
    res.json({
        msg:"Done!"
    })


})


//get all my notes 
app.get("/notes",(req,res)=>{
    res.json({
        notes
    })
})


//***IMPORTANT 
// above all were backend end point 
// but this time we are writing for frontend end point beacuse we are both-frontend and backend developer 
app.get("/",(req,res)=>{
    res.sendFile("/home/arpit/classes_webDevelopment/notes_apk/frontend/index.html")
})

app.listen(3000,()=> {
    console.log("The Server is running properly")
})