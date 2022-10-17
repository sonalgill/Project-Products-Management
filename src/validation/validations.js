const mongoose = require("mongoose")

module.exports = {
  isValidObjectId: function isValidObjectId(value) {
    return mongoose.Types.ObjectId.isValid(value)
  },
  objectValue: (value) => {
    if (typeof value === "undefined" || value === null ) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "object" && Object.keys(value).length === 0) return false;
    return true;
  },
  emailRegex: (value) => {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/;
    return emailRegex.test(value)
  },
  phoneRegex: (value) => {
      return (/^[6-9]\d{9}$/.test(value))
  },
  isValidPassword: (value) => {
    if (value.length > 15 || value.length < 8) {
      return false
    }
    return true
  },
  pincodeRegex: (value) => {
      return /^[1-9]{1}[0-9]{5}$/.test(value)
  },
  name: (value) => {
    return /^[a-zA-Z]+$/.test(value)
  },
  validBody: (value) => {
    return Object.keys(value).length
  },
  onlyNum: (value) => {
    return /^[1-9]\d*(\.\d+)?$/.test(value)
  },
  num: (value) => {
    return /^[0-9]+$/.test(value)
  }
}
