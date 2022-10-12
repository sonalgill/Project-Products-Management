
// {
//   _id: ObjectId("88abc190ef0288abc190ef55"),
//   title: 'Nit Grit',
//   description: 'Dummy description',
//   price: 23.0,
//   currencyId: 'INR',
//   currencyFormat: '₹',
//   isFreeShipping: false,
//   productImage: 'http://function-up-test.s3.amazonaws.com/products/product/nitgrit.jpg',  // s3 link
//   style: 'Colloar',
//   availableSizes: ["S", "XS","M","X", "L","XXL", "XL"],
//   installments: 5,
//   deletedAt: null, 
//   isDeleted: false,
//   createdAt: "2021-09-17T04:25:07.803Z",
//   updatedAt: "2021-09-17T04:25:07.803Z",
// }



// ### GET /products
// - Returns all products in the collection that aren't deleted.
//   - __Filters__
//     - Size (The key for this filter will be 'size')
//     - Product name (The key for this filter will be 'name'). You should return all the products with name containing the substring recieved in this filter
//     - Price : greater than or less than a specific value. The keys are 'priceGreaterThan' and 'priceLessThan'. 

// > **_NOTE:_** For price filter request could contain both or any one of the keys. For example the query in the request could look like { priceGreaterThan: 500, priceLessThan: 2000 } or just { priceLessThan: 1000 } )

//   - __Sort__
//     - Sorted by product price in ascending or descending. The key value pair will look like {priceSort : 1} or {priceSort : -1}
//   _eg_ /products?size=XL&name=Nit%20grit
// - __Response format__
//   - _**On success**_ - Return HTTP status 200. Also return the product documents. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

const productModel = require("../model/productModel")
const v = require("../validation/validations")

module.exports = {
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
    }
}




module.exports = {
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
