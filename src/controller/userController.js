const userModel = require("../model/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const awsFunction = require('./aws')
const uploadFile = awsFunction.uploadFile
const v = require('../validation/validations')
//const { isValidObjectId, objectValue, emailRegex, phoneRegex, passwordRegex, pincodeRegex } = require("./validation")



//create user
const createUser = async (req, res) => {
    try {
        let { password, email, phone } = req.body
        let uniqueEmailPhone = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (uniqueEmailPhone) {
            if (uniqueEmailPhone.email == email) {
                return res.status(400).send({
                    status: false,
                    msg: "This Email is already Registered!"
                })
            } if (uniqueEmailPhone.phone == phone) {
                return res.status(400).send({
                    status: false,
                    msg: "This Phone Number is already Registered!"
                })
            }
        }

        let pImage = req.files
        if (!pImage.length) {
            return res.status(400).send({
                status: false,
                msg: "Profile Image is mandatory and can contain a file Only!"
            })
        }
        if (pImage[0].fieldname != 'profileImage') {
            return res.status(400).send({
                status: false,
                msg: "Profile Image is mandatory!"
            })
        }
        if (pImage) {
            let profilePicUrl = await uploadFile(pImage[0])
            req.body.profileImage = profilePicUrl
        }

        let saltRound = 10
        req.body.password = await bcrypt.hash(password, saltRound)

        let user = await userModel.create(req.body)

        res.status(201).send({
            status: true,
            message: "User created successfully!",
            data: user
        })
    } catch (e) {
        res.status(500).send({
            status: false,
            msg: "server",
            msg: e.message
        })
    }
}







////login user////
const login = async function (req, res) {
    try {
        let { email, password } = req.body
        let user = await userModel.findOne({ email: email })
        if (!user) {
            return res.status(400).send({ status: false, message: " No User Found with this Email!" })
        }
        let passwordMatch = bcrypt.compareSync(password, user.password)
        if (!passwordMatch) {
            return res.status(400).send({ status: false, message: "Incorrect E-mail and Password combination!" })
        }
        const generatedToken = jwt.sign({
            userId: user._id
        },
            "group50", 
            { expiresIn: "1d"})
        return res.status(200).send({
            status: true, message: "User login Successful", data: { userID: user._id, token: generatedToken }
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!v.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please enter a valid userId" })

        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser)
            return res.status(404).send({ status: false, message: "User not found!" })

        return res.status(200).send({ status: true, message: "User details", data: findUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        let { email, phone, password, address } = req.body

        if (email || phone) {
            let dupCredentials = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
            if (dupCredentials && dupCredentials.email == email) {
                return res.status(400).send({ status: false, message: "This E-mail is already Registered!" })
            }
            if (dupCredentials && dupCredentials.phone == phone) {
                return res.status(400).send({ status: false, message: "This Phone Number is already Registered!" })
            }
        }
        if (password) {
            let saltRound = 10
            let passwordHash = await bcrypt.hash(password, saltRound)
            req.body.password = passwordHash
        }
        if(req.files.length != 0  && req.files[0].fieldname != 'profileImage'){
            let profilePicUrl = await uploadFile(req.files[0])
            req.body.profileImage = profilePicUrl
        }
        let obj = req.body
        console.log(obj)
        return
        

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}


module.exports = { login, getUser, updateUser, createUser }
