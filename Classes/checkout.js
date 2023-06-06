const ResponseErrors = require('../Utility-Methods/errors')
const Token = require('./token')
const Data = require('../Utility-Methods/http')
const { StatusCodes } = require('http-status-codes')
const data = new Data()
class Checkout{
    
    constructor(products,token ,email){
        this.email = typeof email == 'string'?email:false 
        this.token = typeof token == 'string'?token:false
        this.products = typeof products == 'object' && products instanceof Array? products: false
    }

    async post(){
        if(this.email&&this.products&&this.token){
            try {
                
            
          if(await Token.validate(this.token, this.email)){
            
            
            total = 0
            this.products.forEach(product =>{
                total += product.amount
            })
            const checkoutData = {
                _id : this.email,
                procucts: this.products,
                total:total 
            }
           await data.post('checkout', checkoutData)
           console.log(checkoutData)
           return({status:StatusCodes.CREATED,message:'checkout created'})
          }
          else return ResponseErrors.invalidToken
        } catch (error) {
            return ResponseErrors.serverError
                
        }
        }
        else return ResponseErrors.incorrectData

    }
}

module.exports = Checkout