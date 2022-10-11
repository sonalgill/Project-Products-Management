const express = require("express");
const router = express.Router();

const userController = require('../controller/userController')


//  create user
router.post(
  '/register',
  userController.createUser
)






//=========================== if endpoint is not correct==========================================

router.all("/*", function (req, res) {
  res.status(400).send({
    status: false,
    message: "Make Sure Your Endpoint is Correct !!!",
  });
});

module.exports = router;
