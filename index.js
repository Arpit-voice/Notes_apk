const express = require("express");

const app = express();

app.use(express.json())

const notes = [] // this is bad (in memory db-storing in a variable like this), later we will use mongodb,postgres and mysql for storing databases

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
app.get("/",(req,res)=>{
    
})


app.listen(3000,()=> {
    console.log("The Server is running properly")
})