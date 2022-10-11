const userModel = require("../model/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { models } = require("mongoose")
const awsFunction = require('./aws')
const uploadFile = awsFunction.uploadFile
const v = require('./validation')
const { isValidObjectId, objectValue, emailRegex, phoneRegex, passwordRegex, pincodeRegex } = require("./validation")



//create user
const createUser = async (req, res) => {
    try {
        let { password, fname, lname, email, phone, profileImage } = req.body
        let s = req.body.address.shipping
        let b = req.body.address.billing

        //validations
        if (!fname) {
            return res.status(400).send({
                status: false,
                msg: "fname is mandatory!"
            })
        }
        if (!v.name(fname)) {
            return res.status(400).send({
                status: false,
                msg: "fname can be in Alphabets Only and without Spacing!"
            })
        }
        if (!lname) {
            return res.status(400).send({
                status: false,
                msg: "lname is mandatory!"
            })
        }
        if (!v.name(lname)) {
            return res.status(400).send({
                status: false,
                msg: "lname can be in Alphabets Only and without Spacing!"
            })
        }
        if (!email) {
            return res.status(400).send({
                status: false,
                msg: "email is mandatory!"
            })
        }
        if (!v.emailRegex(email)) {
            return res.status(400).send({
                status: false,
                msg: "Not a Valid E-mail!"
            })
        }
        if (!password) {
            return res.status(400).send({
                status: false,
                msg: "Password is mandatory!"
            })
        }
        if (password.length > 15 || password.length < 8) {
            return res.status(400).send({
                status: false,
                msg: "Length of the Password can be 8 to 15 !"
            })
        }
        if (!phone) {
            return res.status(400).send({
                status: false,
                msg: "Phone is mandatory!"
            })
        }
        if (!v.phoneRegex(phone)) {
            return res.status(400).send({
                status: false,
                msg: "Not a valid Phone Number!"
            })
        }
        if (!s.street || s.street.trim().length == 0) {
            return res.status(400).send({
                status: false,
                msg: "Street is mandatory in Shipping Section!"
            })
        }
        if (!s.city || s.city.trim().length == 0) {
            return res.status(400).send({
                status: false,
                msg: "City is mandatory in Shipping Section!"
            })
        }
        if (!s.pincode) {
            return res.status(400).send({
                status: false,
                msg: "Pincode is mandatory in Shipping Section!"
            })
        }
        if (!v.pincodeRegex(s.pincode)) {
            return res.status(400).send({
                status: false,
                msg: "In Shipping Section, Pincode can be a 6 digits Number Only!"
            })
        }
        if (!b.street || b.street.trim().length == 0) {
            return res.status(400).send({
                status: false,
                msg: "Street is mandatory in Billing Section!"
            })
        }
        if (!b.city || b.city.trim().length == 0) {
            return res.status(400).send({
                status: false,
                msg: "City is mandatory in Billing Section!"
            })
        }
        if (!b.pincode) {
            return res.status(400).send({
                status: false,
                msg: "Pincode is mandatory in Billing Section!"
            })
        }
        if (!v.pincodeRegex(b.pincode)) {
            return res.status(400).send({
                status: false,
                msg: "In Billing Section, Pincode can be a 6 digits Number Only!"
            })
        }
        let uniqueEmailPhone = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (uniqueEmailPhone) {
            if (uniqueEmailPhone.email == email) {
                return res.status(400).send({
                    status: false,
                    msg: "Email has to be Unique!"
                })
            } if (uniqueEmailPhone.phone == phone) {
                return res.status(400).send({
                    status: false,
                    msg: "Phone NUmber has to be Unique!"
                })
            }
        }

        let pImage = req.files
        if(!pImage.length){
            return res.status(400).send({
                status: false,
                msg: "Profile Image is mandatory and can contain a file Only!"
            })
        }
        if(pImage[0].fieldname != 'profileImage'){
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
        const data = req.body
        const { email, password } = data
        if (!isVaildRequestBody(data)) {
            return res.status(400).send({ status: false, message: " Please Provid Data" })
        }
        if (!isVaildEmail(email)) {
            return res.status(400).send({ status: false, message: " Please Provid valid Email" })
        }
        if (!isVaildPassword(password)) {
            return res.status(400).send({ status: false, message: " Please Provid valid Email" })
        }
        let user = await userModel.findone({ email: email })
        if (!user) {
            return res.status(400).send({ status: false, message: " No User Found with this Email" })
        }
        let passwordMatch = bcrypt.compareSync(data.password, user.password)
        if (!passwordMatch) {
            return res.status(400).send({ status: false, message: " Password Doesn't match" })
        }
        const generatedToken = jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60
        }, "group50")
        res.setHeader("Authorization", "Bearer" + generatedToken)
        return res.status(200).send({ status: true, message: "User login Succussful", data: { user: user._id, token: generatedToken } })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please enter a valid userId" })

        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, message: "user not found" })

        return res.status(200).send({ status: true, message: "user details", data: findUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please enter a valid userId" })

        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, message: "user not found" })

        let { fname, lname, email, profileImage, phone, password, address } = req.body

        if (!(fname || lname || email || phone || password || address || profileImage)) {
            return res.status(400).send({ status: false, message: "Please enter a valid field to update!" });
        }
        if (fname) {
            if (!objectValue(fname)) return res.status(400).send({ status: false, message: "Please enter a valid fName!" })
        }

        if (lname) {
            if (!objectValue(lname)) return res.status(400).send({ status: false, message: "Please enter a valid lName!" })
        }

        if (email) {
            if (!objectValue(email)) return res.status(400).send({ status: false, message: "Please enter an email!" })

            if (!emailRegex(email)) return res.status(400).send({ status: false, message: "Please enter a valid email!" })

            let dupEmail = await userModel.find({ email })

            if (dupEmail) return res.status(400).send({ status: true, message: "Email is already in use" })
        }

        if (phone) {
            if (!objectValue(phone)) return res.status(400).send({ status: false, message: "Please enter a phone no.!" })

            if (!phoneRegex(phone)) return res.status(400).send({ status: false, message: "Please enter a valid phone no.!" })

            let dupPhone = await userModel.find({ phone })

            if (dupPhone) return res.status(400).send({ status: true, message: "phone no. is already in use" })
        }

        if (password) {
            if (!objectValue(password)) return res.status(400).send({ status: false, message: "Please enter the password!" })

            if (!passwordRegex(password)) return res.status(400).send({ status: false, message: "Please enter a valid password!" })

            let saltRound = 10

            const passwordHash = await bcrypt.hash(password, saltRound)

            password = passwordHash

        }

        if (address) {
            if (address.shipping) {
                let shipping = address.shipping

                if (shipping.street) {
                    if (!objectValue(shipping.street)) return res.status(400).send({ status: false, message: "please enter your shipping address" })
                }

                if (shipping.city) {
                    if (!objectValue(shipping.city)) return res.status(400).send({ status: false, message: "please enter your shipping city" })
                }

                if (shipping.pincode) {
                    // if(!shipping.pincode || isNaN(shipping.pincode)) return res.status(400).send({status:false,message:"please enter your shipping pincode"})
                    if (!pincodeRegex(shipping.pincode)) return res.status(400).send({ status: false, message: "please enter a valid pincode" })
                }
            }

            if (address.billing) {
                let billing = address.billing

                if (billing.street) {
                    if (!objectValue(billing.street)) return res.status(400).send({ status: false, message: "please enter your billing address" })
                }

                if (billing.city) {
                    if (!objectValue(billing.city)) return res.status(400).send({ status: false, message: "please enter your billing city" })
                }

                if (billing.pincode) {
                    // if (!billing.pincode || isNaN(billing.pincode)) return res.status(400).send({ status: false, message: "please enter your billing pincode" })
                    if (!pincodeRegex(billing.pincode)) return res.status(400).send({ status: false, message: "please enter a valid pincode" })
                }
            }

            let updateUser = await userModel.findOneAndUpdate({_id:userId},{$set:{fname,lname,email,phone,password,address,profileImage}},{new:true})
            
            return res.status(200).send({status:true,message:"successfully updated",data:updateUser})
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}


module.exports = { login, getUser, updateUser, createUser }
