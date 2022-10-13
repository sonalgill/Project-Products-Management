const productModel = require('../model/productModel')
const uploadFile = require('./aws').uploadFile

module.exports = {

    createProduct: async (req, res) => {
        try {
            let { currencyId, currencyFormat, title } = req.body
            let uniqueTitle = await productModel.findOne({title: title})
            if(uniqueTitle)
            return res.status(400).send({status: false, msg: "Title has to be unique!"})
            if (!currencyId) { req.body.currencyId = 'INR' }
            if (!currencyFormat) { req.body.currencyFormat = '₹' }
            if (req.files) {
                let productImage = await uploadFile(req.files[0])
                req.body.productImage = productImage
            }
            let product = await productModel.create(req.body)
            res.status(201).send({ status: true, message: "Product created Successfully!", data: product })
        } catch (e) {
            res.status(500).send({ status: false, msg: e.message })
        }
    }
}