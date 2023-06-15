const statusCodes = require("http-status-codes").StatusCodes;
const Service = require("../services");
const Data = require("../Utility-Methods/http");
const ResponseErrors = require("../Utility-Methods/errors");
const Token = require("./token");
const Image = require("./images");
const Validator = require('../Utility-Methods/validator')
const { StatusCodes } = require("http-status-codes");

const service = new Service();
const data = new Data();
const lengthOfProductId = 21;

module.exports = class Product {
  constructor(
    email,
    name,
    category,
    description,
    price,
    numberInStock,
    token
  ) {
    this.name = name;
    this.category= category;
    this.rating = 0;
    this.description= description
    this.isAvailable = true;
    this.price = price
    this.numberInStock = numberInStock
    this.sellerId = email
    this.email = email
    this.token = token
  }

  async post() {
    if (Validator.stringValidate([this.email,this.category, this.description, this.sellerId, this.token, this.name]) && Validator.numberValidator([this.price,this.numberInStock])) {
      const user = await data.get("users", this.email);

      if (user) {
        if (Token.validate(this.token, this.email)) {
          const product = {
            _id: service.createRandomString(lengthOfProductId),
            name: this.name,
            category: this.category,
            numberInStock: this.numberInStock,
            description: this.description,
            rating: this.rating,
            price: this.price,
            imageConfig: [],
            isAvailable: this.isAvailable,
            sellerId: this.sellerId,
          };
          try {
            await data.post("products", product);
            return {
              status: statusCodes.CREATED,
              message: {
                productId: product._id,
              },
            };
          } catch (error) {
            return {
              status: statusCodes.INTERNAL_SERVER_ERROR,
              message: "unable to create product",
            };
          }
        } else return ResponseErrors.invalidToken;
      } else return ResponseErrors.userNotFound;
    } else return ResponseErrors.incorrectData;
  }

  async get(productId) {
    if (Validator.stringValidate([productId])) {
      try {
        const product = await data.get("products", productId);

        if (product) {
         
          return {
            status: statusCodes.OK,
            message: product,
          };
        } else return ResponseErrors.productNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }
  static async delete(productId) {
    if (Validator.stringValidate([productId])) {
      try {
        const product = await data.get('products', productId)
        if (product) {
          await data.delete("products", productId);
          await Image.deleteImage(product.imageConfig[0].publicId)
          const baskets = await data.getAll('baskets',{})
          baskets.forEach(basket =>{
           
            const newBasket = basket.items.filter(item => item.productId !== productId )
           
            basket.items = newBasket
            data.put('baskets',basket._id,basket)

          })
          return {
            status: 200,
            message: "Product Deleted ",
          };
        } else return ResponseErrors.productNotFound;
      } catch (error) {
        console.log(error)
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async getFeatured(){
    try {
      const products = await data.getAll('products',{})
      console.log(products)
      return {
        status:StatusCodes.OK,
        message:products.slice(0,9)
      }

    } catch (error) {
      console.log(error)
      return ResponseErrors.serverError
      
    }
  }

  static async getByCategory(category){
    if(Validator.stringValidate([category])){
      try {
      const products = await data.getAll('products',{category:category})
      
      return{
        status:StatusCodes.OK,
        message:products
      }
      
    } catch (error) {
      console.log(error)
      return ResponseErrors.serverError
    }
    }
    else return ResponseErrors.incorrectData    
  }

  static async getByName(name){
  if(Validator.stringValidate([name])){
    try {
         let products = await data.getAll('products',{})
    products = products.filter(product => product.name.toLowerCase().includes(name.toLowerCase()) || product.description.toLowerCase().includes(name.toLowerCase()) || product.category.toLowerCase().includes(name.toLowerCase()))
    return {
      status:StatusCodes.OK,
      message:products
    }
    } catch (error) {
      console.log(error)
      return ResponseErrors.serverError
    }
 
  }
  else return ResponseErrors.incorrectData
}

 static async put(name,productId,category,numberInStock, description, price, isAvailable, token, sellerId){
  if ( (Validator.numberValidator([price]) || Validator.numberValidator([numberInStock]) ||  Validator.stringValidate([category]) || Validator.stringValidate([description]) || Validator.stringValidate([]) ||  Validator.stringValidate([name]))  && Validator.stringValidate([productId, sellerId,token])){
   try {

    if(await Token.validate(token, sellerId)){
    const product = await data.get('products',productId)
    if(product.sellerId == sellerId){
      if(name)product.name = name;
      if(category)product.category = category
      if(description)product.description = description
      if(numberInStock)product.numberInStock = numberInStock
      if(isAvailable)product.isAvailable = isAvailable
      else product.isAvailable = false
      if(price)product.price = price

      await data.put('products',productId,product)
      return{
        status:StatusCodes.OK,
        message:'Product updated'
      }
    }
    else return ResponseErrors.invalidToken
   }
   else return ResponseErrors.invalidToken
       
  } catch (error) {
    return ResponseErrors.serverError
  }

  }
  else return ResponseErrors.incorrectData
}


  
};
