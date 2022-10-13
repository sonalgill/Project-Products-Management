const v = require('./validations')

module.exports = {
    createProduct: (req, res, next) => {
        try{
            let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, installments, availableSizes} = req.body
            if(!title || !title.trim().length)
            return res.status(400).send({status: false, msg: "Title is Mandatory. Also, it can't be an Empty String!"})
            if(!description || !description.trim().length)
            return res.status(400).send({status: false, msg: "Description is Mandatory!"})
            if(!price || !price.trim().length)
            return res.status(400).send({status: false, msg: "Price is Mandatory!"})
            if(!v.onlyNum(price))
            return res.status(400).send({status: false, msg: "Price can be a Number Only!"})
            if(currencyId && currencyId != 'INR')
            return res.status(400).send({status: false, msg:"CurrencyId can be INR only!"})
            if(currencyFormat && currencyFormat != '₹')
            return res.status(400).send({status: false, msg:"CurrencyFormat can be ₹ only!"})
            if(isFreeShipping){
            if(isFreeShipping != "true" && isFreeShipping != "false")
            return res.status(400).send({status: false, msg: "isFreeShipping can be true or false only!"})}
            if(style && style.trim().length == 0)
            return res.status(400).send({status: false, msg: "Style can not be an Empty String!"})
            if(!availableSizes)
            return res.status(400).send({status: false, msg: "AvailableSizes is Mandatory!"})
            if(installments){
            if(!v.onlyNum(installments) || installments.length >= 3)
            return res.status(400).send({status: false, msg: "Installments can be a 2 digit number Only!"})}
            next()
        }catch(e){
            res.status(500).send({status: false, msg: e.message})
        }
    }
}