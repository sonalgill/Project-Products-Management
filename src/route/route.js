const express = require("express");
const router = express.Router();

const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const validUser = require('../validation/userValidation')
const validProduct = require('../validation/productValidation')
const validCart = require('../validation/cartValidation')
const mid = require('../middleware/auth');
const orderController = require("../controller/orderController");

//-------------user---------

//  create user
router.post(
  '/register',
  validUser.createUser,
  userController.createUser
)

//login user
router.post(
  '/login',
  validUser.loginUser,
  userController.login
)

//get user
router.get(
  '/user/:userId/profile',
  mid.authentication,
  userController.getUser
)

//update user
router.put(
  '/user/:userId/profile',
  mid.authentication,
  mid.authorisation,
  validUser.updateUser,
  userController.updateUser
)


//------------product-------------

//create product
router.post(
  '/products',
  validProduct.createProduct,
  productController.createProduct
)

//get product by query
router.get(
  '/products',
  validProduct.getProducts,
  productController.getProducts
)

//get product by ID
router.get(
  '/products/:productId',
  productController.getProductById
)


//update product
router.put(
  '/products/:productId',
  validProduct.updateById,
  productController.updateById
)

//delete product
router.delete(
  '/products/:productId',
  productController.deleteProductId
)


//----------cart----------

//create cart
router.post(
  '/users/:userId/cart',
 // mid.authentication,
 // mid.authorisation,
  validCart.createCart,
  cartController.createCart
)

// update cart
router.put(
  "/users/:userId/cart",
  mid.authentication,
  mid.authorisation,
  cartController.updateCart)


// get cart

router.get(
  '/users/:userId/cart',
 // mid.authentication,
 // mid.authorisation,
  cartController.getCart
)

// Delete cart

router.delete("/users/:userId/cart",
 // mid.authentication,
 // mid.authorisation,
  cartController.deleteCart
)

// -------------order-----------

// create order
router.post("/users/:userId/orders",orderController.createorder)

//=========================== if endpoint is not correct==========================================

router.all("/*", function (req, res) {
  res.status(400).send({
    status: false,
    message: "Make Sure Your Endpoint is Correct !!!",
  })
})

module.exports = router;
