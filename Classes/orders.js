const { StatusCodes } = require("http-status-codes");
const ResponseErrors = require("../Utility-Methods/errors");
const Data = require("../Utility-Methods/http");
const Validator = require("../Utility-Methods/validator");
const Token = require("./token");
const data = new Data()

class Orders{


    static async get(token,email){
      if(Validator.stringValidate([token,email])){
        try {
            
      
        if(await Token.validate(token,email)){
        
          const orders = await data.get('orders', email)
          if(orders){
            return{
                status:StatusCodes.OK,
                message:orders
            }
          }
          else return{
            status:StatusCodes.OK,
            message:{
                _id:email,
                orders:[]
            }
          }
        }
    } catch (error) {
            return ResponseErrors.serverError
    }
      }
      else return ResponseErrors.incorrectData
    }
}

module.exports = Orders