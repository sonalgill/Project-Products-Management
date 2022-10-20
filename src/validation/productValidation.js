const v = require('./validations')
const productModel = require('../model/productModel')

module.exports = {
    createProduct: (req, res, next) => {
        try {
            let data = JSON.parse(JSON.stringify(req.body))
            if(!v.validBody(req.body))
             return res.status(400).send({ status: false, msg: "Please provide some data in the body"})
            let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, installments, availableSizes } = req.body
            if (!title || !title.trim().length)
                return res.status(400).send({ status: false, msg: "Title is Mandatory. Also, it can't be an Empty String!" })
            if (!description || !description.trim().length)
                return res.status(400).send({ status: false, msg: "Description is Mandatory!" })
            if (!price || !price.trim().length)
                return res.status(400).send({ status: false, msg: "Price is Mandatory!" })
            if (!v.onlyNum(price))
                return res.status(400).send({ status: false, msg: "Price can be a Number Only!" })
            if (currencyId && currencyId != 'INR')
                return res.status(400).send({ status: false, msg: "CurrencyId can be INR only!" })
            if (currencyFormat && currencyFormat != '₹')
                return res.status(400).send({ status: false, msg: "CurrencyFormat can be ₹ only!" })
            if (isFreeShipping) {
                if (isFreeShipping != "true" && isFreeShipping != "false") {
                    return res.status(400).send({ status: false, msg: "isFreeShipping can be true or false only!" })
                }
            }
            if (data.hasOwnProperty("style") && !style)
                return res.status(400).send({ status: false, msg: "Style can not be an Empty String!" })
            if (!availableSizes)
                return res.status(400).send({ status: false, msg: "AvailableSizes is Mandatory!" })
            if (data.hasOwnProperty("installments") && !installments)
                return res.status(400).send({ status: false, msg: "Installments can't be an Empty String!" })
            if (installments) {
                if (!v.onlyNum(installments) || installments.length >= 3)
                    return res.status(400).send({ status: false, msg: "Installments can be a 2 digit number Only!" })
            }
            next()
        } catch (e) {
            res.status(500).send({ status: false, msg: e.message })
        }
    },

    getProducts: (req, res, next) => {
        try {
            let data = req.query
            let { size, name, priceGreaterThan, priceLessThan, priceSort } = data
            if (data.hasOwnProperty("size") && !size)
                if (!v.objectValue(size)) { return res.status(400).send({ status: false, message: "Please provide size" }) }
            if (data.hasOwnProperty("name") && !name)
                return res.status(400).send({ status: false, message: "Provide some Value to Name!" })
            if (data.hasOwnProperty("priceSort")) {
                if (!(priceSort == 1 || priceSort == -1)) {
                    return res.status(400).send({ status: false, message: "Product sort is only possible with 1 and -1" })
                }
            }
            if (data.hasOwnProperty("priceGreaterThan") && !priceGreaterThan)
                return res.status(400).send({ status: false, message: "Provide some value to priceGreater" })
            if (priceGreaterThan && !v.onlyNum(priceGreaterThan))
                return res.status(400).send({ status: false, message: "priceGreater must be a number" })
            if (data.hasOwnProperty("priceLessThan") && !priceLessThan)
                return res.status(400).send({ status: false, message: "Provide some value to priceLessThan" })
            if (priceLessThan && !v.onlyNum(priceLessThan))
                return res.status(400).send({ status: false, message: "priceLessThan must be a number" })
            next()
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    },

    updateById: async (req, res, next) => {
        try {
            let productId = req.params.productId
            let data = JSON.parse(JSON.stringify(req.body))
            let { title, description, price, isFreeShipping, productImage, style, availableSizes, installments, currencyFormat, currencyId } = data
            if (Object.keys(data).length == 0)
                return res.status(400).send({ status: false, message: "Please provide data for update" })
            if (!v.isValidObjectId(productId))
                return res.status(400).send({ status: false, message: "Product Id is not vaild" })
            let productExist = await productModel.findById(productId)
            if (!productExist)
                return res.status(404).send({ status: false, message: "Product doesn't exist" })
            if (productExist.isDeleted == true)
                return res.status(400).send({ status: false, message: "Product is deleted" })
                productExist = await productModel.findOne({ title: title })
            if (productExist)
                return res.status(404).send({ status: false, message: "Title already exists!" })
            if (data.hasOwnProperty("title") && !title)
                return res.status(400).send({ status: false, message: "Provide some value to title to be updated" })
            if (data.hasOwnProperty("description") && !description)
                return res.status(400).send({ status: false, message: "Provide some value to description to be updated" })
            if (data.hasOwnProperty("price") && !v.onlyNum(price))
                return res.status(400).send({ status: false, message: "Provide some Number to price to be updated" })
            if (data.hasOwnProperty("productImage") && !productImage)
                return res.status(400).send({ status: false, message: "Attach a file to productImage to be updated!" })
            if (currencyFormat && currencyFormat != 'INR')
                return res.status(400).send({ status: false, message: "currencyFormat can be INR only!" })
            if (currencyId && currencyId != '₹')
                return res.status(400).send({ status: false, message: "currencyId can be ₹ only!" })
            if (isFreeShipping) {
                if (isFreeShipping != "true" && isFreeShipping != "false")
                    return res.status(400).send({ status: false, msg: "isFreeShipping can be true or false only!" })
            }
            if (data.hasOwnProperty("style") && !style)
                return res.status(400).send({ status: false, message: "Provide some value to style!" })
            if (data.hasOwnProperty("installments") && (!v.onlyNum(installments) || installments.length > 2))
                return res.status(400).send({
                    status: false, message: "Provide some Number (maximum 2 digit) to installments to be updated"
                })
            if (data.hasOwnProperty("availableSizes") && !availableSizes)
                return res.status(400).send({ status: false, message: "Provide some Size to be updated!" })
            next()
        }
        catch (e) {
            res.status(500).send({ status: false, msg: e.message })
        }
    }
}