
const userModel = require("../model/userModel")
const cartModel = require("../model/cartModel")
const orderModel = require("../model/orderModel")
const v = require("../validation/validations")


module.exports = {
    createorder: async function (req, res) {
        try {
            let userId = req.params.userId
            let { cartId, cancellable, status } = req.body

            if (!v.objectValue(userId)) return res.status(400).send({ status: false, message: "please provide userId" })
            if (!v.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "please provide a valid userId" })

            if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "All fields are empty" })

            if (!v.objectValue(cartId)) return res.status(400).send({ status: false, message: "please provide cartId" })
            if (!v.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "please provide a valid cartId" })

            let findUser = await userModel.findOne({ _id: userId })
            if (!findUser) return res.status(404).send({ status: false, message: "user not found" })

            let cart = await cartModel.findOne({ _id: cartId, userId: userId, isDeleted: false })

            if (!cart) return res.status(404).send({ status: false, message: "cart doesn't exist" })

            if (cart.userId != userId) return res.status(404).send({ status: false, message: "cart not found with this userId" })

            let items = cart.items
            let totalQuantity = 0
            for (let i of items) {
                totalQuantity += i.quantity
            }

            let orderData = cart.toObject()
            delete orderData["_id"]
            orderData.totalQuantity=totalQuantity

            // let orderData = {
            //     userId:cart.userId,
            //     items:items,
            //     totalItems:cart.totalItems,
            //     totalQuantity:totalQuantity,
            //     totalPrice:cart.totalPrice
            // }
            
            if (cancellable) {
                if (cancellable != true || false) return res.status(400).send({ status: false, message: "Cancellable can only be boolean" })
                orderData["cancellable"] = cancellable
            }
            if (status) {
                orderData["status"] = status
            }
            let orderCreation = await orderModel.create(orderData)
            await cartModel.findOneAndDelete({ _id: cartId, userId: userId, isDeleted: false }, { $set: { items: [], totalPrice: 0, totalQuantity: 0 } })
            return res.status(201).send({ status: true, message: "Succcess", data: orderCreation })
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    }
}