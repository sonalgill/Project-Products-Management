const productModel = require('../model/productModel')
const uploadFile = require('./aws').uploadFile
const v = require("../validation/validations")

module.exports = {

    createProduct: async (req, res) => {
        try {
            let { currencyId, currencyFormat, title, description, style, availableSizes } = req.body
            req.body.title = title.replace(/  +/g, ' ').trim()
            title = req.body.title
            let uniqueTitle = await productModel.findOne({ title: { $regex: title, $options: 'i' } })
            if (uniqueTitle)
                return res.status(400).send({ status: false, msg: "Title has to be unique!" })
            let pImage = req.files
            if (!pImage.length)
                return res.status(400).send({ status: false, msg: "Product Image is mandatory and can contain a file Only!" })
            if (pImage[0].fieldname != 'productImage')
                return res.status(400).send({ status: false, msg: "Product Image is mandatory!" })
            if (!currencyId) { req.body.currencyId = 'INR' }
            if (!currencyFormat) { req.body.currencyFormat = '₹' }
            if (req.files) {
                let productImage = await uploadFile(req.files[0])
                req.body.productImage = productImage
            }
            availableSizes = availableSizes.replace(/  +/g, '').split(",")
            req.body.availableSizes = availableSizes
            let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
      
            for (let i = 0; i < availableSizes.length; i++) {
                if (!sizes.includes(availableSizes[i])) {
                    return res.status(400).send({ status: false, msg: `availableSizes can be among [S, XS, M, X, L, XXL, XL] only` })
                }
            }

            req.body.description = description.replace(/  +/g, ' ')
            if (style) { req.body.style = style.replace(/  +/g, ' ') }
            let product = await productModel.create(req.body)
            res.status(201).send({ status: true, message: "Product created Successfully!", data: product })
        } catch (e) {
            res.status(500).send({ status: false, msg: e.message })
        }
    },

    getProducts: async function (req, res) {
        try {
            let data = req.query
            let { size, name, priceGreaterThan, priceLessThan, priceSort } = data

            let filter = { isDeleted: false }

            if (size) {
                let sizeArray = size.trim().split(",").map((s) => s.trim())
                filter.availableSizes = { $all: sizeArray }
            }

            if (name) {
                filter.title = name.trim()
            }

            if (priceGreaterThan) {
                filter.price = { $gt: priceGreaterThan }
            }

            if (priceLessThan) {
                filter.price = { $lt: priceLessThan }
            }

            if (priceGreaterThan && priceLessThan) {
                filter.price = { $gte: priceGreaterThan, $lte: priceLessThan }
            }

            let productList = await productModel.find(filter).sort({ price: priceSort })

            if (productList.length == 0) return res.status(404).send({ status: false, message: "No products available with this spec" })

            return res.status(200).send({ status: true, message: "product Lists", data: productList })
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    },
    getProductById: async function (req, res) {
        try {
            let productId = req.params.productId
            if (!v.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter a valid productId" })

            let findProduct = await productModel.findOne({ _id: productId })
            if (!findProduct)
                return res.status(404).send({ status: false, message: "Product not found!" })

            return res.status(200).send({ status: true, message: "User details", data: findProduct })
        } catch (err) {
            return res.status(500).send({ status: false, Message: err.Message })
        }
    }
}
