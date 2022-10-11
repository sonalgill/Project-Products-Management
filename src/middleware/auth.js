const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel")
const mongoose = require("mongoose");

////authentication////
const authentication = async function(req,res,next){
    try{
        let token = req.headers["authorization"];
        if(!token){
            return res.status(401).send({status:false, message: "Please provide token"})
        }
       const decodeToken = jwt.decode(token)
       if(!decodeToken){
        return res.status(401).send({status:false, message: "invaild authentication"})
       }
       if(Date.now()>(decodeToken.exp)*1000){
        return res.status(440).send({status:false, message: "Session expired Please login again"})
       }
       jwt.verify(token, "group50", function(err, decode){
        if(err){
            return res.status(400).send({status:false, message: "Invaild token"})
        }
        else{
         
            req.token = decodeToken,
            next();
        }
       })
       }
       catch(error){
        req.status(500).send({status:false, message:error.message})
       }
    }

    ////////////authorisation//////////
const authorisation = async function(req, res,next){
    try{
        let userId= req.param.userId
        if(!userId){
            return res.status(400).send({status:false, message:"please provide userId"})
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).send({status:false, message:"please provide vaild userId"})
        }
        let user = await userModel.findOne(userId)
        if(!user){
            return res.status(404).send({status:false, message:"User Not found"})
        }
        if(userId!= req.token.userId){
            return res.status(403).send({status:false, message:"User is not Authorize"})
        }
        next()
    }
    catch(error){
        return res.status(500).send({status:false, message: error.message})
    }
}

module.exports ={authentication,authorisation}