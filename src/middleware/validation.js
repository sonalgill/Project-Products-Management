const mongoose = require("mongoose")

function isValidObjectId(objectId){
    return mongoose.Types.objectId.isValid(objectId)
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

const passwordRegex = (value) => {
  if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/.test(value))
    return true;
}


const pincodeRegex = (value) => {
  if (/^[1-9]{1}[0-9]{5}$/.test(value))
    return true;
}


 module.exports={isValidObjectId,objectValue,emailRegex,phoneRegex,passwordRegex,pincodeRegex}
