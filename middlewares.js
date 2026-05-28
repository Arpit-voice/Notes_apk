const jwt = require("jsonwebtoken")

function authMiddleware (req,res,next){
    //auth things
    const given_token = req.headers.token;
    
    //if they didnt sent the token
    if(!given_token){
        res.status(403).send({
            msg : "You are not logged in"
        })
        //window doesnt exist in node.js
        return;
    }
    const decrypted_token = jwt.verify(given_token ,"secretkey");
    const ourUser_id = decrypted_token.user_id;
    // if there is no username like this
    if(!ourUser_id){
        res.status(403).send({
            msg : "malformed token!!"
        })
        return 
    }

    // now all correct //Authentication done

    // but how to transport this Ouruser to another folder 
    // here comes middleware's another power
    // middleware can change/modify req and res objects
    req.user_id = ourUser_id


    next();
}

module.exports={
    authMiddleware
}
