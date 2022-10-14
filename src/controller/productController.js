const { isValidObjectId } = require('mongoose')
const productModel = require('../model/productModel')
const uploadFile = require('./aws').uploadFile
const v = require("../validation/validations")
const moment = require('moment')

module.exports = {

    createProduct: async (req, res) => {
        try {
            let data = req.body
            let { currencyId, currencyFormat, title, description, style, availableSizes, isFreeShipping } = data
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
            if (!currencyId) {
                req.body.currencyId = 'INR'
            }
            if (!currencyFormat) {
                req.body.currencyFormat = '₹'
            }
            if (Object.hasOwnProperty.bind(data)("isFreeShipping") && !isFreeShipping) {
                req.body.isFreeShipping = false
            }
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
                let sizeArray = size.trim().toUpperCase().split(",").map((s) => s.trim())
                filter.availableSizes = { $all: sizeArray }
            }
            if (name) {
                filter.title = name.trim()
            }
            if (priceGreaterThan && !priceLessThan) {
                filter.price = { $gt: priceGreaterThan }
            }
            if (priceLessThan && !priceGreaterThan) {
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
            if (!v.isValidObjectId(productId))
                return res.status(400).send({ status: false, message: "Please enter a valid productId!" })
            let findProduct = await productModel.findOne({ _id: productId })
            if (!findProduct)
                return res.status(404).send({ status: false, message: "Product not found!" })
            return res.status(200).send({ status: true, message: "Product details", data: findProduct })
        } catch (err) {
            return res.status(500).send({ status: false, Message: err.Message })
        }
    },

    updateById: async (req, res) => {
        try {
            let productId = req.params.productId
            let { title, description, price, isFreeShipping, productImage, style, availableSizes, installments, currencyFormat } = req.body

            if (availableSizes) {
                availableSizes = availableSizes.replace(/  +/g, '').split(",")
                req.body.availableSizes = availableSizes
                let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                for (let i = 0; i < availableSizes.length; i++) {
                    if (!sizes.includes(availableSizes[i])) {
                        return res.status(400).send({ status: false, msg: `availableSizes can be among [S, XS, M, X, L, XXL, XL] only` })
                    }
                }
            }
            let filter = {}
            if (title) {
                req.body.title = title.replace(/  +/g, ' ')
                filter.title = title
            }
            if (description) {
                req.body.description = description.replace(/  +/g, ' ')
                filter.description = description
            }
            if (price) { filter.price = price }
            if (style) {
                req.body.style = style.replace(/  +/g, ' ')
                filter.style = style
            }
            if (req.files) {
                if(req.files[0] && req.files[0].fieldname == 'productImage'){
                let productImage = await uploadFile(req.files[0])
                filter.productImage = productImage}
            }
            if (installments) { filter.installments = installments }
            if (isFreeShipping) { filter.isFreeShipping = isFreeShipping }
            if (!availableSizes) { availableSizes = [] }

            let finalUpdate = await productModel.findByIdAndUpdate(
                { _id: productId },
                { $set: filter, $push: { availableSizes: { $each: availableSizes } } },
                { new: true });
            return res.status(200).send({ status: true, message: finalUpdate })
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message })
        }
    },

    deleteProductId: async (req, res) => {
        try {
            let productId = req.params.productId
            if (!v.isValidObjectId(productId))
                return res.status(400).send({ status: false, message: "Invaild productId!" })
            let isExist = await productModel.findById(productId)
            if (!isExist)
                return res.status(404).send({ status: false, message: "Product Id dosen't exist!" });
            if (isExist.isDeleted == true)
                return res.status(400).send({ status: false, message: "Product is already deleted!" });
            let deleteProduct = await productModel.findOneAndUpdate({ _id: productId },
                { $set: { isDeleted: true, deletedAt: moment().format() } },
                { new: true, upsert: true })
            return res.status(200).send({ status: true, message: "Product deleted Successfully!", data: deleteProduct })
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message })
        }
    }
}