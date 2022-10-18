// {
//     userId: {ObjectId, refs to User, mandatory, unique},
//     items: [{
//       productId: {ObjectId, refs to Product model, mandatory},
//       quantity: {number, mandatory, min 1}
//     }],
//     totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
//     totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
//     createdAt: {timestamp},
//     updatedAt: {timestamp},
//   }

// ### PUT /users/:userId/cart (Remove product / Reduce a product's quantity from the cart)
// - Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart.
// - Get cart id in request body.
// - Get productId in request body.
// - Get key 'removeProduct' in request body. 
// - Make sure that cart exist.
// - Key 'removeProduct' denotes whether a product is to be removed({removeProduct: 0}) or its quantity has to be decremented by 1({removeProduct: 1}).
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get product(s) details in response body.
// - Check if the productId exists and is not deleted before updating the cart.
// - __Response format__
//   - _**On success**_ - Return HTTP status 200. Also return the updated cart document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

// {
//     "_id": ObjectId("88abc190ef0288abc190ef88"),
//     userId: ObjectId("88abc190ef0288abc190ef02"),
//     items: [{
//       productId: ObjectId("88abc190ef0288abc190ef55"),
//       quantity: 2
//     }, {
//       productId: ObjectId("88abc190ef0288abc190ef60"),
//       quantity: 1
//     }],
//     totalPrice: 50.99,
//     totalItems: 2,
//     createdAt: "2021-09-17T04:25:07.803Z",
//     updatedAt: "2021-09-17T04:25:07.803Z",
//   }


    
const cartModel = require('../model/cartModel')
const productModel = require('../model/productModel')
const { isValidObjectId } = require('../validation/validations')
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
            return res.status(200).send({status:true,msg:"success",data:updateCart})

        } catch (err) {
            return res.status(500).send({ status: false, msg: err.message })
        }
    }
}
//////////////get api//////////

let getCart = async function(req,res){
    try{
        let userId = req.params.userId
        if(!userId){
            return res.status(400).send({status:false, message:"Please provide UserId"})}
        if(!v.isValidObjectId(userId)){
            return res.status(400).send({status:false, message:"Please provide vaild UserId"})
        }
        let isUserExist = await userModel.findId({userId})
        if(!isUserExist){
            return res.status(404).send({status:false, message:"User cannot be found"})

        }
        let findCart = await cartModel.findById({userId})
        if(!findCart){
            return res.status(404).send({status:false, message:"No cart for this user "})}
        if(findCart.items.length){
            return res.status(404).send({status:false, message:"User have nothing in Cart"})
        }
        return res.status(200).send({status:false, message:"Cart Details", data:findCart})

        }catch(error){
            return res.status(500).send({status:false, message:error.message})
        }
        }
        

//////delete api/////////////////
let deleteCart = async function(req,res){
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