const { isValidObjectId } = require('mongoose')
const { update } = require('../model/productModel')
const productModel = require('../model/productModel')
const { objectValue } = require('../validation/validations')
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
///////////////update api/////////////

const updateById = async function(req,res){
    try{
        const productId = req.params.productId;
        const data = req.body;
        const files = req.files
        const{title, description, price, isFreeShipping, productImage, style, availableSizes, installments}= data
        if (Object.keys(data).length==0){
            return res.status(400).send({status:false, message:"Please provide data for update"})
        }
        if(!v.isValidObjectId(productId)){
            return res.status(400).send({status:false, message:"Product Id is not vaild"})

        }
        let productExist = await productmodel.findById({_id:productId})
        if(!productExist){
            return res.status(404).send({status:false, message:"Product doesn't exist"})
        }
        if(productExist.isDeleted==true){
            return res.status(400).send({status:false, message:"Product is deleted"})
        }
        let updateProduct = {isDeleted:false}
        if(title)
        if(!objectValue(title)){
            return res.status(400).send({status:false, message:"Provide titile to be updated"})
        }
        let existTitle = await productmodel.findOne({title:title})
        if(existTitle){
            return res.status(400).send({status:false, message:"title already exist to be updated"})
        }
        updateProduct["title"]= title;

        if(description){
        if(!objectValue(description)){
        return res.status(400).send({status:false, message:"Provide description to be updated"})
            }
        }
        updateProduct["description"]= description;

        if(price){
        if(!objectValue(price)){
            return res.status(400).send({status:false, message:"Provide price to be updated"})

        }
        }
        updateProduct["price"]=price

        if (currencyFormat) {
            if (!objectValue(currencyFormat)) {
                return res.status(400).send({ status: false, message: "Provide currency data to be updated" });
            }
            updateProduct["currencyFormat"] = currencyFormat;
        }

        if (isFreeShipping) {
        if (!objectValue(isFreeShipping)) {
            return res.status(400).send({ status: false, message: "Provide freeshipping data to be updated" });
            }
            updateProduct["isFreeShipping"] = isFreeShipping;
        }
        
        if (style) {
        if (!objectValue(style)) {
            return res.status(400).send({ status: false, message: "Enter some data" });
            }
            updateProduct["style"] = style;
        }

        if (installments) {
        if (!objectValue(installments)) {
            return res.status(400).send({ status: false, message: "Enter some data" });
            }

            updateProduct["installments"] = installments;
        }
///enum validation////
        let isValidEnum = (enm) =>{
            var uniqueEnums = [...new Set(enm)];
            const enumList = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            return enm.length === uniqueEnums.length && enm.every(e => enumList.includes(e));
        }
        ///////
        if (availableSizes) {
        if (!isValidData(availableSizes)) {
           return res.status(400).send({ status: false, message: "Enter some data" });
            }
        let availableSize = availableSizes.split(',').map(s=>s.trim().toUpperCase())
        if(!isValidEnum(available)){
            return res.status(400).send({ status: false, message: `only allow S, XS, M, X, L, XXL, XL` })

        }
        // updateProduct["availableSize"]=availableSize

        if(productImage){
        if(files&& files.length>0){
        productUrl = await uploadFile(files[0])}
        updateProduct["productImage"]= productUrl
        }

     let finalUpdate = await productmodel.findOneAndUpadte({
        _id:productId},{
        $set:{
            updateProduct},
        
        $push:{
            availableSizes:{
                $each: availableSize////testing
            }
        }
    },
        {new:true});
     return res.status(200).send({status:true, message: finalUpdate })

    }}catch(error){
        return res.status(500).send({status:false, message:error.message})
    }
}

////////////delete api/////////
let deleteProductId= async function(req,res){
    try{
        let productId= req.params.productId
        if(!v.isValidObjectId(productId)){
            return res.status(400).send({status:false, message:"Invaild productId"})
        }
        let isExist = await productModel.findById({_id:productId})
        if(!isExist){
            return res.status(404).send({ status: false, message: "Product Id dosen't exists." });
        }
        if(isExist.isDeleted==true){
            return res.status(400).send({ status: false, message: "Product is already deleted." });
         }
         let deleteProduct = await productModel.findOneAndUpdate({_id:productId}, {$set:{isDeleted:true, deletedAt:Date.now()}},{new:true})
         return res.status(200).send({status:true, message:"Product deleted Successfully", data:deleteProduct})
    }catch(error){
        return res.status(500).send({status:false, message:error.message})

    }
}