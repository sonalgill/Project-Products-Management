const cartModel = require('../model/cartModel')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const { isValidObjectId } = require('../validation/validations')
const v = require('../validation/validations')

module.exports = {
    createCart: async (req, res) => {
        try {
            let data = req.body
            let userId = req.params.userId
            let {cartId, productId } = data
            let sameCartUser
            if (cartId) {
                if (!v.isValidObjectId(cartId))
                    return res.status(400).send({ status: false, msg: "Please provide a Valid CartID!" })
                sameCartUser = await cartModel.findOne({ $and: [{ _id: cartId }, { userId: userId }] })
                if (!sameCartUser)
                    return res.status(400).send({ status: false, msg: "This CartId doesn't belong to this User!!" })
            }
            let product = await productModel.findById(productId)
            if (!product)
                return res.status(400).send({ status: false, msg: "Product doesn't exists!" })
                if(!data.quantity){
                    req.body.quantity = 1
                quantity = req.body.quantity}
            let totalPrice = product.price * quantity
            
            
            if (cartId) {
                let productPresent = sameCartUser['items']
                for (let i = 0; i < productPresent.length; i++) {
                    if (productPresent[i].productId == productId) {
                        let cart = await cartModel.findOneAndUpdate(
                            { _id: cartId, 
                            'items.productId': productId},
                            { $inc: { totalPrice: totalPrice, "items.$.quantity": quantity} },
                            { new: true }
                        )
                        return res.status(201).send({ status: true, message: "Success", data: cart })
                    }
                }
                let cart = await cartModel.findByIdAndUpdate(
                    { _id: cartId },
                    { $push: { items: {productId: productId, quantity: quantity} }, $inc: { totalPrice: totalPrice, totalItems: 1 } },
                    { new: true}
                )
                return res.status(201).send({ status: true, message: "Success", data: cart })
            }
            let cart = await cartModel.create({ userId: userId, items: {productId: productId, quantity: quantity}, totalPrice: totalPrice, totalItems: 1})
            return res.status(201).send({ status: true, message: "Success", data: cart })
        } catch (e) {
            return res.status(500).send({ status: false, msg: e.message })
        }
    },

    getCart : async function(req,res){
        try{
            let userId = req.params.userId
            if(!userId){
                return res.status(400).send({status:false, message:"Please provide UserId"})}
            if(!v.isValidObjectId(userId)){
                return res.status(400).send({status:false, message:"Please provide vaild UserId"})
            }
            let findCart = await cartModel.findOne({userId: userId})
            if(!findCart){
                return res.status(404).send({status:false, message:"No cart for this user "})}
            return res.status(200).send({status:true, message:"Success", data:findCart})
    
            }catch(error){
                return res.status(500).send({status:false, message:error.message})
            }
            },


    updateCart: async (req, res) => {
        try {
            let data = req.body
            let userId = req.params.userId

            let { cartId, productId, removeProduct } = data

            if (!userId) return res.status(400).send({ status: false, msg: "Please enter userId" })
            if (!v.isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "Please enter a valid userId" })

            if (!cartId) return res.status(400).send({ status: false, msg: "Please enter cartId" })
            if (!v.isValidObjectId(cartId)) return res.status(400).send({ status: false, msg: "Please enter a valid cartId" })

            if (!productId) return res.status(400).send({ status: false, msg: "Please enter productId" })
            if (!v.isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "Please enter a valid productId" })

            if (!(removeProduct == 0 || removeProduct==1)) return res.status(400).send({ status: false, msg: "Remove product can only be 0 and 1" })

            let cart = await cartModel.findOne({ userId })
            if (!cart) return res.status(400).send({ status: false, msg: "Cart is not present in database" })
            if (cart.items.length == 0) return res.status(400).send({ status: false, msg: "Cart is empty" })

            let product = await productModel.findOne({ productId })
            if (!product) return res.status(404).send({ status: false, msg: "Product not found" })

            let cartItems = cart.items
            let ProductQuantity = undefined
            let totalPrice = undefined
            let totalItems = undefined

            if (removeProduct == 1) {
                for (let i in cartItems) {
                    if (cartItems[i].productId == productId) {
                        ProductQuantity = cartItems[i].quantity-1
                        cartItems[i].quantity=ProductQuantity
                        totalPrice = cart.totalPrice - product.price

                        if(cartItems[i].quantity == 0){
                            cartItems.splice(i,1)
                            totalItems=cart.totalItems-1
                        }
                        break;
                    }
                }
               
            }

            if(removeProduct==0){
                for(let i in cartItems){
                    if(cartItems[i].productId==productId){
                        totalPrice = cart.totalPrice-(product.price*cartItems[i].quantity)
                        totalItems = cart.totalItems-1
                        cartItems.splice(i,1)
                        break;
                    }

                }
            }
            if(cartItems.length==0){
                totalPrice = 0
                totalItems = 0
            }
            let updateCart = await cartModel.findOneAndUpdate({_id:cartId},{items:cartItems,totalPrice:totalPrice,totalItems:totalItems},{new:true})
            return res.status(200).send({status:true,message:"Success",data:updateCart})

        } catch (err) {
            return res.status(500).send({ status: false, msg: err.message })
        }
    },

    deleteCart: async function(req,res){
        try{
            let userId= req.params.userId
            if(!userId){
                return res.status(400).send({status:false, message:"Please provide Userid"})
            }
            if(!v.isValidObjectId){
                return res.status(400).send({status:false, message:"Please provide vaild userId"})
            }
             let findUser = await userModel.findById({userId})
             if(!findUser){
                return res.status(404).send({status:false, message:"user Doesn't exist"})
             }
             let findCart =await cartModel.findOne({userId})
             if(!findCart){
                return res.status(404).send({status:false, message:"No cart has found for this user id"})
             }
             if(findCart.items.length==0){
                return res.status(404).send({status:false, message:"Cart Items has been deleted"})
             }
             let newCart = await cartModel.findByIdAndUpdate(findCart,{ $set:{items:[], totalItems:0, totalPrice:0}},{new:true})
             return res.status(204).send({status:false, message: "Cart Deleted Successfully", data:newCart})
    
        }catch(error){
            return res.status(500).send({status:false, message:error.message})
        }
    }
}  
