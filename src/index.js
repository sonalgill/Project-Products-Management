const express = require("express");
const route = require("./route/route.js");
const app = express();
const mongoose = require("mongoose");
const multer = require('multer')
const { AppConfig } = require('aws-sdk')

app.use(express.json());
app.use(multer().any());

mongoose
  .connect(
    "mongodb+srv://payal-chaudhary:BDoIPGJ3FjU4qpys@cluster0.jjm7nst.mongodb.net/Group50Database",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log(err))
  

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
