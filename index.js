const express = require("express");

const app = express();

app.use(express.json())

app.get("/",()=>{
    
})


app.listen(3000,()=> {
    console.log("The Server is running properly")
})