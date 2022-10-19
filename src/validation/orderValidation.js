const userModel = require('../model/userModel')
const v = require('./validations')

module.exports = {

    createOrder: async (req, res, next) => {
        try {
            let userId = req.params.userId
            let { cartId, cancellable, status } = req.body

            if (!v.isValidObjectId(userId))
                return res.status(400).send({ status: false, message: "please provide a valid userId" })
            if (!v.validBody(req.body))
                return res.status(400).send({ status: false, message: "Provide some Data in the Body" })
            if (!cartId)
                return res.status(400).send({ status: false, message: "please provide cartId" })
            if (!v.isValidObjectId(cartId))
                return res.status(400).send({ status: false, message: "please provide a valid cartId" })
            let findUser = await userModel.findOne({ _id: userId })
            if (!findUser) return res.status(404).send({ status: false, message: "user not found" })
            next()
        } catch (e) {
            return res.status(500).send({ status: false, msg: e.message })
        }
    },

    updateOrder: async (req, res, next) => {
        try {
            let userId = req.params.userId
            let { orderId, status } = req.body

            if (!v.isValidObjectId(userId))
                return res.status(400).send({ status: false, message: "Not a valid UserId!" })
            let user = await userModel.findById(userId)
            if (!user)
                return res.status(404).send({ status: false, message: "No such User Exists!" })
            if (v.validBody(req.body))
                return res.status(400).send({ status: false, message: "Provide some Data in the Body!" })
            if (!orderId)
                return res.status(400).send({ status: false, message: "Please provide OrderID!" })
            if (!v.isValidObjectId(orderId))
                return res.status(400).send({ status: false, message: "Not a valid OrderId!" })
            if (!status)
                return res.status(400).send({ status: false, message: "Please provide the Status to be Updated" })
            if (status) {
                if (status != 'pending' || status != 'completed' || status != 'cancelled')
                    return res.status(400).send({ status: false, message: "Status can be among ['pending', 'completed', 'cancelled'] only!" })
            }
            next()
        } catch (e) {
            return res.status(500).send({ status: false, msg: e.message })
        }
    }
}