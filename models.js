const mongoose = require("mongoose")
async function connection(){
    await mongoose.connect("mongodb+srv://arpit:1234567890@cluster0.r4gka8o.mongodb.net/notes")
}
connection();

const userSchema = new mongoose.Schema({
    username : String,
    password : String
})

const notesSchema = new mongoose.Schema({
    note : String,
    user_id : mongoose.Types.ObjectId
})


const usermodel = mongoose.model("users",userSchema)
const notemodel = mongoose.model("notes",notesSchema)



module.exports = {
    usermodel,
    notemodel
}