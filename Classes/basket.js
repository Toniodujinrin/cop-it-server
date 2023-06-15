const Data = require("../Utility-Methods/http");
const Token = require("./token");
const ResponseErrors = require("../Utility-Methods/errors");
const { StatusCodes } = require("http-status-codes");
const Validator = require('../Utility-Methods/validator')
const data = new Data();
class Basket {
  static async getBasket(email, token) {
    if (Validator.stringValidate([email,token])) {
      const user = await data.get("users", email);
      if (user && (await Token.validate(token, email))) {
        const basket = await data.get("baskets", email);
        if (basket) {
          const _resolve = basket.items.map(async item=>{
            const product = await data.get('products',item.productId)
            
            if(product){
              item.product = product
              delete item.productId
            } 
           
          }
            )
            await Promise.all(_resolve)
          return {
            status: StatusCodes.OK,
            message: basket,
          };
        } else {
          return {
            status: StatusCodes.OK,
            message: {},
          };
        }
      } else return ResponseErrors.invalidToken;
    } else return ResponseErrors.incorrectData;
  }

  static async editItemAmount(email, productId, amount, token) {
    if (Validator.stringValidate([token,email,productId])) {
      try {
        const user = await data.get("users", email);
        if (user) {
          if (await Token.validate(token, email)) {
            const product = await data.get("products", productId);
            if (product) {
              let basket = await data.get("baskets", email);
              if (basket) {
                const filteredBasket = basket.items.filter(
                  (item) => item.productId === productId
                );
                if (filteredBasket.length > 0) {
                  if (amount === 0) {
                    basket.items = basket.items.filter(
                      (item) => item.productId !== productId
                    );
                  } else {
                    basket.items.map((item) => {
                      if (item.productId === productId && item.amount <= product.numberInStock) {
                        item.amount = amount;
                      }
                      else return ResponseErrors.amountExceeded
                    });
                  }
                    await data.put("baskets", email, basket);
                    return {
                      status: StatusCodes.OK,
                      message: "item added to basket",
                    };
                  
                } else return ResponseErrors.productNotFound;
              } else return ResponseErrors.basketEmpty;
            } else return ResponseErrors.productNotFound;
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        console.log(error);
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }
  static async addItem(email, productId, amount, token) {
    if (Validator.stringValidate([email,productId,token])&&Validator.numberValidator([amount])) {
      try {
        const user = await data.get("users", email);
        if (user) {
          if (await Token.validate(token, email)) {
            const product = await data.get("products", productId);
            if (product) {
              if(product.numberInStock >= amount){
              const basket = await data.get("baskets", email);
              if (basket) {
                if (
                  basket.items.filter((item) => item.productId === productId)
                    .length > 0
                ) {
                  basket.items.map((item) => {
                    if (item.productId === productId) {
                      if(item.amount+amount <= product.numberInStock){
                         item.amount = item.amount + amount;
                      }
                      else return ResponseErrors.amountExceeded
                     }
                  });
                  
                } else {
                  basket.items.unshift({ productId: productId, amount: amount });
                }

              
              } else {
                if(amount <= product.numberInStock){
                  const _basket = {
                    _id: email,
                    items: [
                      {
                        productId: productId,
                        amount: amount,
                      },
                    ],
                  };
  
                  await data.post("baskets", _basket);
                  return {
                    status: StatusCodes.OK,
                    message: "item added to basket",
                  };
                }
                else return ResponseErrors.amountExceeded
              
              }
            }
            else return ResponseErrors.amountExceeded
            } else return ResponseErrors.productNotFound;
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async removeItem(productId, token, email) {
    if (Validator.stringValidate([email, productId, token])) {
      try {
        if (await Token.validate(token, email)) {
          const basket = await data.get("baskets", email);
          if (basket) {
            const product = basket.items.find(
              (item) => item.productId == productId
            );
            if (product) {
              basket.items = basket.items.filter((item) => item !== product);
              await data.put("baskets", email, basket);
              
              return {
                status: StatusCodes.OK,
                message: "Item removed from basket",
              };
            } else return ResponseErrors.productNotFound;
          } else return ResponseErrors.basketEmpty;
        } else return ResponseErrors.invalidToken;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }
}

module.exports = Basket;
