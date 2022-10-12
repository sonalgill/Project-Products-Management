const mongoose = require("mongoose")

function isValidObjectId(value){
    return mongoose.Types.ObjectId.isValid(value)
}

const objectValue = (value) => {
    if (typeof value === "undefined" || value === null || typeof value === "boolean" || typeof value === "number") return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "object" && Object.keys(value).length === 0) return false;
  
    return true;
  };

  const emailRegex = (value) => {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/;
    if (emailRegex.test(value)) return true;
  };

  
const phoneRegex = (value) => {
  if (/^[6-9]\d{9}$/.test(value))
    return true;
}

const isValidPassword = (value) => {
    if(value.length > 15 || value.length < 8){
        return false
    }
    return true
}


const pincodeRegex = (value) => {
  if (/^[1-9]{1}[0-9]{5}$/.test(value))
    return true;
}

const name = (value) => {
  return /^[a-zA-Z]+$/.test(value)
}

const validBody = (value) => {
    return Object.keys(value).length
}


module.exports={isValidObjectId,objectValue,emailRegex,phoneRegex,isValidPassword,pincodeRegex, name, validBody}
