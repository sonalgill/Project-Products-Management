const userModel= require("../model/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { models } = require("mongoose")



////login user////
 const login = async function(req,res){
    try{
        const data = req.body
        const {email, password}= data
        if(!isVaildRequestBody(data)){
            return res.status(400).send({status: false, message:" Please Provid Data"})
        }
        if(!isVaildEmail(email)){
            return res.status(400).send({status: false, message:" Please Provid valid Email"})
        }
        if(!isVaildPassword(password)){
            return res.status(400).send({status: false, message:" Please Provid valid Email"})
        }
        let user = await userModel.findone({email:email})
        if(!user){
            return res.status(400).send({status: false, message:" No User Found with this Email"})
        }
        let passwordMatch = bcrypt.compareSync(data.password, user.password)
        if(!passwordMatch){
            return res.status(400).send({status: false, message:" Password Doesn't match"})
        }
        const generatedToken = jwt.sign({
            userId:user._id,
            iat: Math.floor(Date.now()/1000),
            exp: Math.floor(Date.now()/1000)+ 60*60*60
        }, "group50")
        res.setHeader("Authorization", "Bearer"+ generatedToken)
        return res.status(200).send({status:true, message: "User login Succussful", data:{user:user._id, token:generatedToken}})

    }catch(error){
        return res.status(500).send({status:false, message:error.message})
    }
 }

module.export={login}