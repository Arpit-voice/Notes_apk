const express = require("express");
const jwt = require("jsonwebtoken")
const{ authMiddleware } = require("./middlewares")
const {Pool} = require("pg")
const bcrypt = require("bcrypt")
const z= require("zod")

const pool= new Pool({
    connectionString : "postgresql://neondb_owner:npg_BniQ96PuJcIb@ep-rough-math-ap0c7osc-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&connect_timeout=30"
    ,connectionTimeoutMillis: 30000,
    max: 2,
})
// Wake up NeonDB on server start
    const warmUp = async (retries = 10) => {
    for (let i = 1; i <= retries; i++) {
        try {
            const client = await pool.connect();
            console.log("DB warmed up!");
            client.release();
            return;
        } catch (err) {
            const msg = err.message || err.errors?.[0]?.message || "unknown error";
            console.log(`Warm-up attempt ${i}/${retries} failed: ${msg} — retrying in 8s...`);
            if (i < retries) await new Promise(r => setTimeout(r, 8000)); // wait 8 seconds
        }
    }
    console.log("DB could not be warmed up after all retries");
};

warmUp();

const app = express();

app.use(express.json())

app.use(express.static("frontend"));  ////css file also came 

const signupSchema = z.object({
    username : z.string().min(3),
    password : z.string().min(3),
    email : z.email()
})



// signup page 
app.post("/signup",async (req,res)=>{
    /// Input schema check 
    /// req.body = {"username" : string , "password": string , "email":string}
    const {data , success ,error} = signupSchema.safeParse(req.body)
    if(!success)(
        res.status(403).json({
            msg : "Incorrect input formats",
            error : JSON.parse()
        })
    )

    const newUsername = req.body.username;
    const userPassword = data.password;
    const hashedPassword = await bcrypt.hash(userPassword,10);

    // const userExist = await usermodel.findOne({
    //     username : newUsername,
    //     password : userPassword
    // })

    // if(userExist){
    //     return res.status(403).json({
    //         msg : "User with this username already exists"
    //     })
    // }

// query = INSERT INTO users (username , password) VALUES ('newUsername','userPassword');
    //another better way//
    let query = `INSERT INTO users (username , password) VALUES ($1,$2) RETURNING id;`  
    console.log(query)
    try {
        const response = await pool.query(query, [newUsername, hashedPassword]);
        console.log(response);
        res.json({
            id: response.rows[0].id, 
            msg: "You have signed up" 
        });
    } catch(err) {
        const msg = err.message || err.errors?.map(e => e.message).join(', ') || JSON.stringify(err);
        console.log("signup error:", msg);
        res.status(500).json({ msg: "Signup failed: " + msg });
    }
})

//signin page 
// :( signin is a post method:) get req have no body
app.post("/signin",async (req,res)=>{
    const givenUsername = req.body.username;
    const givenPassword = req.body.password;
    
    // const userExist =await usermodel.findOne({
    //     username : givenUsername,
    //     password : givenPassword
    // })
    // if(!userExist){
    //     res.status(403).json({
    //         msg : "Incorrect Credentials"
    //     })
    //     return 
    // }
    let query = `SELECT * FROM users WHERE username =$1` 
    console.log(query)
    const response = await pool.query(query,[givenUsername])
    console.log(response)

    const userExist = response.rows[0];
    if(!userExist){
        res.status(411).json({
            msg : "No user with this username exists"
        })
        return
    }

    // lets say user exist /// now server backend person will create some token(string) with their encryption method 
    // and return the token to the browser
    // now onwards the browser will send me this token as a request in header  
    // use the protocol of json web tokens(stateless)
    const correctPassword =await bcrypt.compare(givenPassword, userExist.password); 
    // bcrypt will firstly import salt of the DB password then pair it with given password and hash the given and then compare with both 
    if(!correctPassword) {
        res.json({
            msg : "YOUR PASSWORD IS INCORRECT !!!"
        })
    }
    
    const token = jwt.sign({
        user_id : userExist.id
    }, "secretkey") 
    // only backend developer of the website know

    res.json({
        token : token,
        msg : " signin done"
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