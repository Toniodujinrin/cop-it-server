const ResponseErrors = require('../Utility-Methods/errors')
const Token = require('./token')
const Data = require('../Utility-Methods/http')
const { StatusCodes } = require('http-status-codes')
const Services = require('../services')
const Validator = require('../Utility-Methods/validator')
const { stringValidate } = require('../Utility-Methods/validator')
const Templates = require('./EmailTemplates')

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
            this.products.map(product=>{
                product.productId = product.product._id
                delete product.product
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
          products.map(product=>{
           
            product.productId = product.product._id
            delete product.product
          } )
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
            console.log(error)
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
                const _resolve =  checkout.products.map( async item=>{
                const product = await data.get('products',item.productId)
                if(product)item.product = product
                delete item.productId
               })
               await Promise.all(_resolve)
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
                const _resolve =  checkout.products.map( async item=>{
                    const product = await data.get('products',item.productId)
                    if(product)item.product = product
                    delete item.productId
                   })
                   await Promise.all(_resolve)
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

    static async processGuestCheckout (products,  firstName, address,lastName,email, phone,  ){
        products = typeof products == 'object' && products instanceof Array?products:false 
        if(products && Validator.stringValidate([firstName,lastName,address,email,phone])){
            let checkoutEligible = true 
                const _resolve = products.map(async product=>{
                    const __product = await data.get('products', product.product._id)
                    if(!__product.isAvailable){
                     checkoutEligible = false
                    }
                   
                })
                await Promise.all(_resolve)
            if(checkoutEligible){
                let total = 0
                  
                products.forEach(product =>{
                  
                  total += product.amount*product.product.price
      
                })
                const orderId = service.createRandomString(20)
                  const order = 
                  {
                    _id:orderId,
                    products:products,
                    timeOrdered:Date.now(),
                    total:total,
                    email:email,
                    firstName:firstName,
                    lastName:lastName,
                    phone:phone,
                    address:address,
                    
                  }

                  await data.post('guest-orders',order)
                  const templateConfig = {
                    "{firstName}":firstName,
                    "{orderID}":orderId,
                    "{lastName}":lastName,
                    "{total}":`$${total}`,
                    "{address}":address,
                    "{fullName}":`${firstName} ${lastName}`
                  }
                  const confirmationEmail = Templates.formatConfirmationEmail(templateConfig)
                  service.confirmationMailSender(confirmationEmail,email)
                
                  const _resolve2 = products.map(async product=>{
                        
                    const __product = await data.get('products',product.product._id)
                    __product.numberInStock -= product.amount
                    if(__product.numberInStock == 0){
                        __product.isAvailable = false 
                    }
                    await data.put('products',__product._id, __product)

                })
                await Promise.all(_resolve2)


                  return {
                    status:StatusCodes.OK,
                    message:'checkout successfull'
                  }
                  
                 
                  

            }
            else return ResponseErrors.invalidCheckout

        }
        else return ResponseErrors.incorrectData

        
    }

    static async processCheckout (products, email, token){
        products = typeof products == 'object' && products instanceof Array? products: false
        if(products && Validator.stringValidate([token,email])){
            try {
             if (await Token.validate(token,email)){
                let checkoutEligible = true 
                const _resolve = products.map(async product=>{
                    const __product = await data.get('products', product.product._id)
                    if(!__product.isAvailable){
                     checkoutEligible = false
                    }
                    
                })
                await Promise.all(_resolve)
                if(checkoutEligible){
                    let total = 0
                  
                  products.forEach(product =>{
                    
                    total += product.amount*product.product.price
        
                  })
                   const orderId = service.createRandomString(20)
                    const order = 
                    {
                      orderId:orderId,
                      products:products,
                      timeOrdered:Date.now(),
                      buyer:email,
                      total:total
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
                    const user = await  data.get('users',email)
                    const {firstName,lastName,address}= user
                    const templateConfig = {
                        "{firstName}":firstName,
                        "{orderID}":orderId,
                        "{lastName}":lastName,
                        "{total}":`$${total}`,
                        "{address}":address,
                        "{fullName}":`${firstName} ${lastName}`
                      }
                      const confirmationEmail = Templates.formatConfirmationEmail(templateConfig)
                      service.confirmationMailSender(confirmationEmail,email)
                    await data.delete('checkout',email)
                    const basket = await data.get('baskets',email)
                    if(basket){
                      basket.items = basket.items.filter(product=> !products.find(_product => _product.product._id == product.productId))
                      await data.put('baskets',email,basket)
                    }
                    
                   
                   
    
                    const _resolve2 = products.map(async product=>{
                        
                        const __product = await data.get('products',product.product._id)
                        __product.numberInStock -= product.amount
                        if(__product.numberInStock == 0){
                            __product.isAvailable = false 
                        }
                        await data.put('products',__product._id, __product)

                    })
                    await Promise.all(_resolve2)

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