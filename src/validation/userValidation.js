const v = require('./validations')
const userModel = require('../model/userModel')

module.exports = {
    createUser: (req, res, next) => {
        try {
            let { password, fname, lname, email, phone, address } = req.body

            if (!v.validBody(req.body))
                return res.status(400).send({ status: false, message: "Please Provide Some Data!" })
            if (!fname)
                return res.status(400).send({ status: false, msg: "fname is mandatory!" })
            if (!v.name(fname))
                return res.status(400).send({ status: false, msg: "fname can be in Alphabets Only and without Spacing!" })
            if (!lname)
                return res.status(400).send({ status: false, msg: "lname is mandatory!" })
            if (!v.name(lname))
                return res.status(400).send({ status: false, msg: "lname can be in Alphabets Only and without Spacing!" })
            if (!email)
                return res.status(400).send({ status: false, msg: "email is mandatory!" })
            if (!v.emailRegex(email))
                return res.status(400).send({ status: false, msg: "Not a Valid E-mail!" })
            if (!password)
                return res.status(400).send({ status: false, msg: "Password is mandatory!" })
            if (!v.isValidPassword(password))
                return res.status(400).send({ status: false, msg: "Length of the Password can be 8 to 15 !" })
            if (!phone)
                return res.status(400).send({ status: false, msg: "Phone is mandatory!" })
            if (!v.phoneRegex(phone))
                return res.status(400).send({ status: false, msg: "Not a valid Phone Number!" })
            if (!address)
                return res.status(400).send({ status: false, msg: "Address is mandatory!" })
            if (!address.shipping)
                return res.status(400).send({ status: false, msg: "Please provide Shipping Address!" })
            let s = address.shipping
            if (!s.street || s.street.trim().length == 0)
                return res.status(400).send({ status: false, msg: "Street is mandatory in Shipping Section!" })
            if (!s.city || s.city.trim().length == 0)
                return res.status(400).send({ status: false, msg: "City is mandatory in Shipping Section!" })
            if (!s.pincode)
                return res.status(400).send({ status: false, msg: "Pincode is mandatory in Shipping Section!" })
            if (!v.pincodeRegex(s.pincode))
                return res.status(400).send({ status: false, msg: "In Shipping Section, Pincode can be a 6 digits Number Only!" })
            if (!address.billing)
                return res.status(400).send({ status: false, msg: "Please provide Billing Address!" })
            let b = address.billing
            if (!b.street || b.street.trim().length == 0)
                return res.status(400).send({ status: false, msg: "Street is mandatory in Billing Section!" })
            if (!b.city || b.city.trim().length == 0)
                return res.status(400).send({ status: false, msg: "City is mandatory in Billing Section!" })
            if (!b.pincode)
                return res.status(400).send({ status: false, msg: "Pincode is mandatory in Billing Section!" })
            if (!v.pincodeRegex(b.pincode))
                return res.status(400).send({ status: false, msg: "In Billing Section, Pincode can be a 6 digits Number Only!" })
            next()
        } catch (e) {
            res.status(500).send({ status: false, msg: e.message })
        }
    },

    loginUser: (req, res, next) => {
        try {
            let { email, password } = req.body
            if (!v.validBody(req.body))
                return res.status(400).send({ status: false, message: "Please Provide Some Data!" })
            if (!v.emailRegex(email))
                return res.status(400).send({ status: false, message: "Please Provide a valid E-mail!" })
            if (!v.isValidPassword(password))
                return res.status(400).send({ status: false, message: " Please Provide a valid Password!" })
            next()
        } catch (e) {
            res.status(500).send({ status: false, msg: e.message })
        }
    },

    updateUser: async (req, res, next) => {
        try {
            let userId = req.params.userId
            let data = req.body
            if (!v.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please enter a valid userId!" })

            let findUser = await userModel.findOne({ _id: userId })
            if (!findUser) return res.status(404).send({ status: false, message: "User not found!" })

            let { fname, lname, email, phone, password, address, profileImage } = req.body
            if (!v.validBody(data))
                return res.status(400).send({ status: false, msg: "Provide some Data to be Updated!" })
            if (data.fname && !fname || !v.name(fname))
                return res.status(400).send({ status: false, message: "Please enter a valid fName!" })
            if (data.lname && !lname || !v.name(lname))
                return res.status(400).send({ status: false, message: "Please enter a valid lName!" })
            if (data.email && !email ||  !v.emailRegex(email))
                return res.status(400).send({ status: false, message: "Please enter a valid email!" })
            if (data.phone && !v.phoneRegex(phone))
                return res.status(400).send({ status: false, message: "Please enter a valid phone no.!" })
            if (data.password && !v.isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Length of the Password can be 8 to 15 !" })
            }
            if (data.profileImage && !v.objectValue(profileImage)) {
                return res.status(400).send({ status: false, message: "ProfileImage can contain a file Only!" })
            }
            if (data.profileImage &&
                (!profileImage || (req.files.length == 0 || req.files[0].fieldname != 'profileImage'))) {
                return res.status(400).send({ status: false, msg: "Please attach a file in ProfileImage!" })
            }
            if (data.address && data.address.shipping) {
                let s = address.shipping
                if (s.street && s.street.trim().length == 0) {
                    return res.status(400).send({ status: false, msg: "Street can not be an Empty String in Shipping Section!" })
                }
                if (s.city && s.city.trim().length == 0) {
                    return res.status(400).send({ status: false, msg: "City can not be an Empty String in Shipping Section!" })
                }
                if (s.pincode && !v.pincodeRegex(s.pincode)) {
                    return res.status(400).send({ status: false, msg: "In Shipping Section, Pincode should be a 6 digit Number Only!" })
                }
            }
            if (address && address.billing) {
                let b = address.billing
                if (b.street && b.street.trim().length == 0) {
                    return res.status(400).send({ status: false, msg: "Street can not be an Empty String in Shipping Section!" })
                }
                if (b.city && b.city.trim().length == 0) {
                    return res.status(400).send({ status: false, msg: "City can not be an Empty String in Shipping Section!" })
                }
                if (b.pincode && !v.pincodeRegex(b.pincode)) {
                    return res.status(400).send({ status: false, msg: "In Shipping Section, Pincode should be a 6 digit Number Only!" })
                }
            }
           next()
        } catch (e) {
            res.status(500).send({ status: false, msg: e.message })
        }
    }
}