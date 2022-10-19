const userModel = require("../model/userModel")
const cartModel = require("../model/cartModel")
const orderModel = require("../model/orderModel")
const v = require("../validation/validations")


module.exports = {

    createorder: async function (req, res) {
        try {
            let userId = req.params.userId
            let { cartId, cancellable, status } = req.body

            let cart = await cartModel.findOne({ _id: cartId, userId: userId, isDeleted: false })
            if (!cart)
                return res.status(404).send({ status: false, message: "cart doesn't exist!" })
            if (cart.userId != userId)
                return res.status(404).send({ status: false, message: "This cart doesn't belong to this user!" })

            let items = cart.items
            let totalQuantity = 0
            for (let i of items) {
                totalQuantity += i.quantity
            }

            let orderData = cart.toObject()
            delete orderData["_id"]
            orderData.totalQuantity = totalQuantity

            if (cancellable) {
                if (cancellable != true || false) return res.status(400).send({ status: false, message: "Cancellable can only be boolean" })
                orderData["cancellable"] = cancellable
            }
            if (status) {
                orderData["status"] = status
            }
            let orderCreation = await orderModel.create(orderData)
            await cartModel.findOneAndUpdate({ _id: cartId, userId: userId, isDeleted: false }, { $set: { items: [], totalPrice: 0, totalQuantity: 0 } })
            return res.status(201).send({ status: true, message: "Success", data: orderCreation })
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    },

    updateOrder: async (req, res) => {
        try {
            let userId = req.params.userId
            let { orderId, status } = req.body

            let sameUserOrder = await orderModel.findById(orderId)
            if (!sameUserOrder)
                return res.status(400).send({ status: false, message: "No such Order Exists!" })
            if (sameUserOrder.cancellable == false && status == 'cancelled')
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