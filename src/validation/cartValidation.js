const v = require('./validations')
const cartModel = require('../model/cartModel')

module.exports = {
    createCart: async (req, res, next) => {
        try {
            let userId = req.params.userId
            let { productId, quantity, cartId } = req.body
            if (!v.isValidObjectId(userId))
                return res.status(400).send({ status: false, msg: "Please provide a Valid UserID!" })
            if (!v.validBody(req.body))
                return res.status(400).send({ status: false, msg: "Provide some Data in the Cart!" })
            let cartUser = await cartModel.findOne({ userId: userId })
            if (cartUser && !cartId)
                return res.status(400).send({ status: false, msg: "Cart is already created.Please provide CartId!" })

            if (!productId)
                return res.status(400).send({ status: false, msg: "ProductId is required!" })
            if (!v.isValidObjectId(productId))
                return res.status(400).send({ status: false, msg: "Please provide a Valid ProductId!" })
            if (quantity && !v.num(quantity))
                return res.status(400).send({ status: false, msg: "Quantity can be a Number Only!" })
            next()
        } catch (e) {
            return res.status(500).send({ status: false, msg: e.message })
        }
    },

    updateCart: async (req, res, next) => {
        try {
            let data = req.body
            let userId = req.params.userId
            let { cartId, productId, removeProduct } = data
            if (!v.isValidObjectId(userId))
                return res.status(400).send({ status: false, msg: "Please enter a valid userId" })
            if (!v.validBody(req.body))
                return res.status(400).send({ status: false, msg: "Please provide Some Data in the Body!" })
            if (!cartId)
                return res.status(400).send({ status: false, msg: "Please enter cartId" })
            if (!v.isValidObjectId(cartId))
                return res.status(400).send({ status: false, msg: "Please enter a valid cartId" })
            if (!productId)
                return res.status(400).send({ status: false, msg: "Please enter productId" })
            if (!v.isValidObjectId(productId))
                return res.status(400).send({ status: false, msg: "Please enter a valid productId" })
            if (!(removeProduct == 0 || removeProduct == 1))
                return res.status(400).send({ status: false, msg: "Remove product can only be 0 and 1" })
            next()
        } catch (e) {
            return res.status(500).send({ status: false, msg: e.message })
        }
    }
}