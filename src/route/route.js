const express = require("express");
const router = express.Router();

const userController = require('../controller/userController')
const validation = require('../validation/userValidation')
const mid = require('../middleware/auth')


//  create user
router.post(
  '/register',
  validation.createUser,
  userController.createUser
)

//login user
router.post(
  '/login',
  validation.loginUser,
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
  validation.updateUser,
  userController.updateUser
)






//=========================== if endpoint is not correct==========================================

router.all("/*", function (req, res) {
  res.status(400).send({
    status: false,
    message: "Make Sure Your Endpoint is Correct !!!",
  });
});

module.exports = router;
