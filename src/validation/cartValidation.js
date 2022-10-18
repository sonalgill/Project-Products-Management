const v = require('./validations')
const userModel = require('../model/userModel')
const productModel = require('../model/productModel')
const cartModel = require('../model/cartModel')

module.exports = {
    createCart: async (req, res, next) => {
        try {
            let userId = req.params.userId
            let { productId, quantity, cartId } = req.body
            if (!v.isValidObjectId(userId))
                return res.status(400).send({ status: false, msg: "Please provide a Valid UserID!" })
            let cartUser = await cartModel.findOne({ userId: userId })
            if (cartUser && !cartId)
                return res.status(400).send({ status: false, msg: "Cart is already created.Please provide CartId!" })
            if (!v.validBody(req.body))
                    return res.status(400).send({ status: false, msg: "Provide some Data in the Cart!" })
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
    }
}