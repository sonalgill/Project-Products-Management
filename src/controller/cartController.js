const cartModel = require('../model/cartModel')
const productModel = require('../model/productModel')
const v = require('../validation/validations')

module.exports = {
    createCart: async (req, res) => {
        try {
            let data = req.body
            let userId = req.params.userId
            let { items, cartId } = data
            let sameCartUser
            if (cartId) {
                if (!v.isValidObjectId(cartId))
                    return res.status(400).send({ status: false, msg: "Please provide a Valid CartID!" })
                sameCartUser = await cartModel.findOne({ $and: [{ _id: cartId }, { userId: userId }] })
                if (!sameCartUser)
                    return res.status(400).send({ status: false, msg: "This CartId doesn't belong to this User!!" })
            }
            let product = await productModel.findById(items.productId)
            if (!product)
                return res.status(400).send({ status: false, msg: "Product doesn't exists!" })
                if(!items.quantity){ items.quantity = 1}
            let totalPrice = product.price * items.quantity
            
            
            if (cartId) {
                let productPresent = sameCartUser['items']
                for (let i = 0; i < productPresent.length; i++) {
                    if (productPresent[i].productId == items.productId) {
                        let cart = await cartModel.findOneAndUpdate(
                            { _id: cartId, 
                            'items.productId': items.productId},
                            { $inc: { totalPrice: totalPrice, "items.$.quantity": items.quantity} },
                            { new: true, upsert: true }
                        )
                        return res.status(201).send({ status: true, msg: "Product Added to cart Successfully!", data: cart })
                    }
                }
                let cart = await cartModel.findByIdAndUpdate(
                    { _id: cartId },
                    { $push: { items: items }, $inc: { totalPrice: totalPrice, totalItems: 1 } },
                    { new: true, upsert: true }
                )
                return res.status(201).send({ status: true, msg: "Product Added to cart Successfully!", data: cart })
            }
            let cart = await cartModel.create({ userId: userId, ...data, totalPrice: totalPrice, totalItems: 1 })
            return res.status(201).send({ status: true, msg: "Product Added to cart Successfully!", data: cart })
        } catch (e) {
            return res.status(500).send({ status: false, msg: e.message })
        }
    }
}