const orderModel = require('../model/orderModel')
const userModel = require('../model/userModel')
const v = require('../validation/validations')
module.exports = {
    updateOrder: async (req, res) => {
        try {
            let userId = req.params.userId
            let { orderId, status } = req.body

            let sameUserOrder = await orderModel.findById(orderId)
            if (!sameUserOrder)
                return res.status(400).send({ status: false, message: "No such Order Exists!" })
            if(sameUserOrder.cancellable == flase)
            return res.status(400).send({ status: false, message: "This Order can't be cancelled!" })
            if (sameUserOrder.userId != userId)
                return res.status(400).send({ status: false, message: "This OrderID doesn't belong to this User!" })
            let updateOrder = await orderModel.findByIdAndUpdate(orderId, { $set: { status: status } }, { new: true })
            res.status(200).send({ status: true, message: 'Success', data: updateOrder })
        } catch (e) {
            return res.status(500).send({ status: false, msg: e.message })
        }
    }
}