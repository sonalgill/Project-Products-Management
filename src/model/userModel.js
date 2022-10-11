const mongoose = require('mongoose')


const userSchema = new mongoose.Schema(
    {
        fname: {
            type: String,
            required: true
        },
        fname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        profileImage: {
            type: String,
           // required: true
        },
        phone: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
          //  minlength: 8,
          //  maxlength: 15
        },
        address: {
            shipping: {
                street: {
                    type: String,
                    required: true
                },
                city: {
                    type: String,
                    required: true
                },
                pincode: {
                    type: Number,
                    required: true
                }
            },
            billing: {
                street: {
                    type: String,
                    required: true
                },
                city: {
                    type: String,
                    required: true
                },
                pincode: {
                    type: Number,
                    required: true
                }
            }
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('user', userSchema)