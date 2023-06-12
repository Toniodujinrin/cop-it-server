const ResponseErrors = require('../Utility-Methods/errors')
const Token = require('./token')
const Data = require('../Utility-Methods/http')
const { StatusCodes } = require('http-status-codes')
const Services = require('../services')
const Validator = require('../Utility-Methods/validator')
const service = new Services()
const data = new Data()
class Checkout{
    
    constructor(products,token ,email){
        this.email = email
        this.token = token
        this.products = typeof products == 'object' && products instanceof Array? products: false
    }

    async post(){
        if(this.products&&Validator.stringValidate([this.token,this.email])){
            try {
                
            
          if(await Token.validate(this.token, this.email)){
            if(await data.get('checkout',this.email)){
                await data.delete('checkout',this.email)
            }
            let total = 0
            let items = 0
            this.products.forEach(product =>{
                items += product.amount
                total += product.amount*product.product.price
            })
            const checkoutData = {
                _id : this.email,
                products: this.products,
                total:total,
                items:items
            }
           await data.post('checkout', checkoutData)
      
           return({status:StatusCodes.CREATED,message:'checkout created'})
          }
          else return ResponseErrors.invalidToken
        } catch (error) {
            console.log(error)
            return ResponseErrors.serverError
           
        }
        }
        else return ResponseErrors.incorrectData

    }
    static async guestCheckout(products){
        products = typeof products == 'object' && products instanceof Array? products: false
        if(products){
            try {
                
           
            let total = 0
            let items = 0 
          products.forEach(product =>{
            items += product.amount
            total += product.amount*product.product.price

          })
          const checkoutId = service.createRandomString(20)
          const checkoutData = {
            _id : checkoutId ,
            products: products,
            total:total,
            items:items,
            expiry:Date.now()+24 * 60 * 60 * 1000
        }

           await data.post('guest-checkout',checkoutData)
           return{
            status:StatusCodes.CREATED,
            message:{checkoutId:checkoutId}
           }
         } catch (error) {
                 return ResponseErrors.serverError
            }
        }
        else return ResponseErrors.incorrectData
        
    }

    static async getGuestCheckout(checkoutId){
        if(Validator.stringValidate([checkoutId])){
           try {
            const checkout = await data.get('guest-checkout',checkoutId)
            if(checkout){
                return{
                    status:StatusCodes.OK,
                    message:checkout
                }
            }
            else return ResponseErrors.checkoutNotFound
           } catch (error) {
            return ResponseErrors.serverError
           }
        }
        else return ResponseErrors.incorrectData
    }
    static async get(token, email){
        if(Validator.stringValidate([token,email])){
            if(await Token.validate(token,email)){
              const checkout = await data.get('checkout', email)
              if(checkout){
                 return {
                status:StatusCodes.OK,
                message:checkout
              }
              }
              else return ResponseErrors.checkoutNotFound
             
            }
            else return ResponseErrors.invalidToken
        }
        else return ResponseErrors.incorrectData
        
    }

    static async processCheckout (products, email, token){
        products = typeof products == 'object' && products instanceof Array? products: false
        if(products && Validator.stringValidate([token,email])){
            try {
             if (await Token.validate(token,email)){
                let checkoutEligible = true 
                const __products = products.map(async product=>{
                    const __product = await data.get('products', product.product._id)
                    if(!__product.isAvailable){
                     checkoutEligible = false
                    }
                    console.log(__product)
                })
                await Promise.all(__products)
                if(checkoutEligible){
                    const order = 
                    {
                      orderId:service.createRandomString(20),
                      products:products
                    }
                    let orders = await data.get('orders', email)
                   
                    if(orders){
                      orders.orders.unshift(order)
                      await data.put('orders',email,orders)
                    }
                    else{
                        orders = {
                            _id : email,
                            orders:[order]
                        }
                        
                        await data.post('orders',orders)
                    }
                    await data.delete('checkout',email)
                    const basket = await data.get('baskets',email)
                    basket.items = basket.items.filter(product=> !products.find(_product => _product.product._id == product.product._id))
                   
                    await data.put('baskets',email,basket)
    
                    products.forEach(async product=>{
                        
                        const __product = await data.get('products',product.product._id)
                        __product.numberInStock -= product.amount
                        if(__product.numberInStock == 0){
                            __product.isAvailable = false 
                        }
                        await data.put('products',__product._id, __product)

                    })
                    return{
                        status:StatusCodes.OK,
                        message:'Checkout Successfull'
                    }
                }
                else return ResponseErrors.invalidCheckout
                


                }
                else return ResponseErrors.invalidToken
            }
             catch (error) {
                console.log(error)
                return ResponseErrors.serverError
                
                
            }
        }
        else return ResponseErrors.incorrectData

        
        
        

      
    }
}



module.exports = Checkout