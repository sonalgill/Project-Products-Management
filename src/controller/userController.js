const userModel = require("../model/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const awsFunction = require('./aws')
const uploadFile = awsFunction.uploadFile
const v = require('../validation/validations')
const { objectValue, pincodeRegex } = require("../validation/validations")

module.exports = {
    createUser: async (req, res) => {
        try {
            let { password, email, phone } = req.body
            let uniqueEmailPhone = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
            if (uniqueEmailPhone) {
                if (uniqueEmailPhone.email == email)
                    return res.status(400).send({ status: false, msg: "This Email is already Registered!" })
                if (uniqueEmailPhone.phone == phone)
                    return res.status(400).send({ status: false, msg: "This Phone Number is already Registered!" })
            }
            let pImage = req.files
            if (!pImage.length)
                return res.status(400).send({ status: false, msg: "Profile Image is mandatory and can contain a file Only!"})
            if (pImage[0].fieldname != 'profileImage')
                return res.status(400).send({ status: false, msg: "Profile Image is mandatory!"})
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
    },

    login: async function (req, res) {
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
                { expiresIn: "1d" })
            return res.status(200).send({
                status: true, message: "User login successfull!", data: { userID: user._id, token: generatedToken }
            })
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message })
        }
    },
    
    getUser: async function (req, res) {
        try {
            let userId = req.params.userId
            if (!v.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please enter a valid userId" })
    
            let findUser = await userModel.findOne({ _id: userId })
            if (!findUser)
                return res.status(404).send({ status: false, message: "User not found!" })
    
            return res.status(200).send({ status: true, message: "User profile details", data: findUser })
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    },

    updateUser: async function (req, res) {
        try {
            let userId = req.params.userId
            let data = req.body
            let {fname, lname,email, phone, address, password}=data
            let filter={}
            if (fname) {filter["fname"] = fname }
            if(lname){filter["lname"]= lname}
            if (email || phone) {
                let dupCredentials = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
                if (dupCredentials && dupCredentials.email == email) {
                    return res.status(400).send({ status: false, message: "This E-mail is already Registered!" })
                }
                if (dupCredentials && dupCredentials.phone == phone) {
                    return res.status(400).send({ status: false, message: "This Phone Number is already Registered!" })
                }
            }
            if(email){filter["email"]=email}
            if(phone){filter["phone"]=phone}
            if (password) {
                let saltRound = 10
                let passwordHash = await bcrypt.hash(password, saltRound)
                password = passwordHash
                filter["password"]=password
            }
            if (req.files.length != 0 && req.files[0].fieldname == 'profileImage') {
                let profilePicUrl = await uploadFile(req.files[0])
                filter["profileImage"]= profilePicUrl
            }
            if (address) {
                if (address.shipping) {
                    if (address.shipping.street) { filter['address.shipping.street'] = address.shipping.street}
                    if (address.shipping.city) {filter['address.shipping.city'] = address.shipping.city}
                    if (address.shipping.pincode) {
                        if (!pincodeRegex.test(address.shipping.pincode)) {
                            return res.status(400).send({ status: false, message: "Shipping pincode is incorrect!" });
                        }
                        filter['address.shipping.pincode'] = address.shipping.pincode;
                    }
               }
                if (address.billing) {
                    if (address.billing.street) { filter['address.billing.street'] = address.billing.street}
                    if (address.billing.city) { filter['address.billing.city'] = address.billing.city}
                    if (address.billing.pincode) {
                        if (!pincodeValid.test(address.billing.pincode)) {
                            return res.status(400).send({ status: false, message: "Billing pincode is incorrect!" });
                        }
                        filter['address.billing.pincode'] = address.billing.pincode;
                    }
               }
            }
            let updateUser = await userModel.findOneAndUpdate({ _id: userId }, { $set: filter}, { new: true, upsert: true })
            res.status(200).send({ status: true, message: "User profile updated!", data: updateUser })
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    }
}

