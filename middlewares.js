const jwt = require("jsonwebtoken")

function authMiddleware (req,res,next){
    //auth things
    const given_token = req.headers.token;
    
    //if they didnt sent the token
    if(!given_token){
        res.status(403).send({
            msg : "You are not logged in"
        })
        return;
    }
    const decrypted_token = jwt.verify(given_token ,"secretkey");
    const ourUser = decrypted_token.username;
    // if there is no username like this
    if(!ourUser){
        res.status(403).send({
            msg : "malformed token!!"
        })
    }

    // now all correct //Authentication done

    // but how to transport this Ouruser to another folder 
    // here comes middleware's another power
    // middleware can change/modify req and res objects
    req.username = ourUser


    next();
}

module.exports={
    authMiddleware
}
