const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel")
const mongoose = require("mongoose");


module.exports = {
    authentication: async function (req, res, next) {
        try {
            let token = req.headers["authorization"];
            if (!token) {
                return res.status(401).send({ status: false, message: "Please provide token" })
            }
            token = token.replace(/^Bearer\s+/, "")
            let decodedToken = jwt.verify(token, "group50", (err, decode) => {
                if (err) {
                    let msg =
                        err.message === "jwt expired" ? "Token is expired" : "Token is invalid";
                    return res.status(400).send({ status: false, message: msg });
                }
                //Seting userId in headers for Future Use
                req.decode = decode;
                next();
            })
        }
        catch (error) {
            res.status(500).send({ status: false, message: error.message })
        }
    },

    authorisation: async function (req, res, next) {
        try {
            let userId = req.params.userId
            if (!userId) {
                return res.status(400).send({ status: false, message: "please provide userId" })
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).send({ status: false, message: "please provide vaild userId" })
            }
            if (userId != req.decode.userId) {
                return res.status(403).send({ status: false, message: "User is not Authorized" })
            }
            next()
        }
        catch (error) {
            return res.status(500).send({ status: false, message: error.message })
        }
    }
}
