const userModel = require("../model/user")
const bcrypt = require("bcrypt")
const { isValidObjectId, objectValue, emailRegex,phoneRegex,passwordRegex,pincodeRegex } = require("../middleware/validation")



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

        if(email){
            if (!objectValue(email)) return res.status(400).send({ status: false, message: "Please enter an email!" })

            if(!emailRegex(email)) return res.status(400).send({ status: false, message: "Please enter a valid email!" })

            let dupEmail = await userModel.find({email})

            if(dupEmail) return res.status(404).send({status:true,message:"Email is already in use"})
        }

        if(phone){
            if (!objectValue(phone)) return res.status(400).send({ status: false, message: "Please enter a phone no.!" })

            if(!phoneRegex(phone)) return res.status(400).send({ status: false, message: "Please enter a valid phone no.!" })

            let dupPhone = await userModel.find({phone})

            if(dupPhone) return res.status(404).send({status:true,message:"phone no. is already in use"})
        }

        if(password){
            if (!objectValue(password)) return res.status(400).send({ status: false, message: "Please enter the password!" })

            if(!passwordRegex(password)) return res.status(400).send({ status: false, message: "Please enter a valid password!" })

            let saltRound = 10

            const passwordHash = await bcrypt.hash(password,saltRound)

            password = passwordHash
           
        }

        if(address){
            if(address.shipping){
                let shipping = address.shipping

                if(shipping.street){
                    if(!objectValue(shipping.street)) return res.status(400).send({status:false,message:"please enter your shipping address"})
                }

                if(shipping.city){
                    if(!objectValue(shipping.city)) return res.status(400).send({status:false,message:"please enter your shipping city"})
                }

                if(shipping.pincode){
                    if(!shipping.pincode || isNaN(shipping.pincode)) return res.status(400).send({status:false,message:"please enter your shipping pincode"})
                    if(!pincodeRegex(shipping.pincode)) return res.status(400).send({status:false,message:"please enter a valid pincode"})
                }
            }

            if(address.billing){
                let billing = address.billing

                if(billing.street){
                    if(!objectValue(billing.street)) return res.status(400).send({status:false,message:"please enter your billing address"})
                }

                if(billing.city){
                    if(!objectValue(billing.city)) return res.status(400).send({status:false,message:"please enter your billing city"})
                }

                if(billing.pincode){
                    if(!billing.pincode || isNaN(billing.pincode)) return res.status(400).send({status:false,message:"please enter your billing pincode"})
                    if(!pincodeRegex(billing.pincode)) return res.status(400).send({status:false,message:"please enter a valid pincode"})
                }
            }
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}


module.exports = { getUser,updateUser }