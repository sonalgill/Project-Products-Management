const v = require('./validations')

module.exports = {
    createProduct: (req, res, next) => {
        try {
            let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, installments } = req.body
            if (!title || !title.trim().length)
                return res.status(400).send({ status: false, msg: "Title is Mandatory!" })
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
            if (isFreeShipping && (isFreeShipping != 'true' || isFreeShipping != 'false'))
                return res.status(400).send({ status: false, msg: "isFreeShipping can be true or false only!" })
            if (style && style.trim().length == 0)
                return res.status.send({ status: false, msg: "Style can not be an Empty String!" })
            next()
        } catch (e) {
            res.status(500).send({ status: false, msg: e.message })
        }
    },

    getProducts:  (req, res, next)=>{
        try {
            let data = req.query
            let { size, title, priceGreaterThan, priceLessThan, priceSort } = data

            if (data.hasOwnProperty("size")) {
                if (!v.objectValue(size)) { return res.status(400).send({ status: false, message: "Please provide size" }) }
            }

            if (data.hasOwnProperty("title")) {
                if (!title) {
                    return res.status(400).send({ status: false, message: "please provide a valid title" })
                }
            }

            if (data.hasOwnProperty(priceSort)) {
                if (!(priceSort == 1 || priceSort == -1)) {
                    return res.status(400).send({ status: false, message: "Product sort is only possible with 1 and -1" })
                }
            }
            if (data.hasOwnProperty("priceGreaterThan") || data.hasOwnProperty("priceLessThan")) {
                if (isNaN(priceGreaterThan) || isNaN(priceLessThan)) {
                    return res.status(400).send({ status: false, message: "priceGreaterThan and priceLessThan must be a number" })
                }
            }

            next()

        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    }
}