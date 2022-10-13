const express = require("express");
const router = express.Router();

const userController = require('../controller/userController')
const productController = require('../controller/productController')
const validUser = require('../validation/userValidation')
const validProduct = require('../validation/productValidation')
const mid = require('../middleware/auth')

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




//=========================== if endpoint is not correct==========================================

router.all("/*", function (req, res) {
  res.status(400).send({
    status: false,
    message: "Make Sure Your Endpoint is Correct !!!",
  });
});

module.exports = router;
