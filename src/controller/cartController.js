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

const v = require('../validation/validations')
const cartModel = require("../model/cartModel")
const userModel = require('../model/userModel')
const productModel = require('../model/productModel')

module.exports = {
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

            if (removeProduct != 0 || removeProduct != 1) return res.status(400).send({ status: false, msg: "Remove product can only be 0 and 1" })

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
                for (let i = 0; i < cartItems.length; i++) {
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
                for(let i=0;i<cartItems.length;i++){
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