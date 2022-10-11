const userModel = require('../model/user')
const bcrypt = require('bcrypt')
const awsFunction = require('./aws')
const uploadFile = awsFunction.uploadFile



module.exports = {
    createUser: async (req, res) => {
        try {
            let { password } = req.body
            let profileImage = req.profileImage

            let saltRound = 10
            req.body.password = await bcrypt.hash(password, saltRound)

            if (profileImage) {
                let profilePicUrl = await uploadFile(profileImage[0])
                req.body.profileImage = profilePicUrl
            }

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
}

