const Data = require("../Utility-Methods/http");
const Token = require("./token");
const ResponseErrors = require("../Utility-Methods/errors");
const { StatusCodes } = require("http-status-codes");
const data = new Data();
class Basket {
  static async getBasket(email, token) {
    email = typeof email == "string" && email.length > 0 ? email : false;
    token = typeof token == "string" && token.length > 0 ? token : false;
    if (token && email) {
      const user = await data.get("users", email);
      if (user && (await Token.validate(token, email))) {
        const basket = await data.get("baskets", email);
        if (basket) {
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
    email = typeof email == "string" && email.length > 0 ? email : false;
    productId =
      typeof productId == "string" && productId.length > 0 ? productId : false;
    amount = typeof amount == "number" || amount === 0 ? amount : false;
    token = typeof token == "string" && token.length > 0 ? token : false;

    if (email && productId && token) {
      try {
        const user = await data.get("users", email);
        if (user) {
          if (await Token.validate(token, email)) {
            const product = await data.get("products", productId);
            if (product) {
              let basket = await data.get("baskets", email);
              if (basket) {
                const filteredBasket = basket.items.filter(
                  (item) => item.product._id === productId
                );
                if (filteredBasket.length > 0) {
                  if (amount === 0) {
                    basket.items = basket.items.filter(
                      (item) => item.product._id !== productId
                    );
                  } else {
                    basket.items.map((item) => {
                      if (item.product._id === productId) {
                        item.amount = amount;
                      }
                    });
                  }
                  if(basket.items.find(item => item.product._id===productId).amount <= product.numberInStock){
                    await data.put("baskets", email, basket);
                    return {
                      status: StatusCodes.OK,
                      message: "item added to basket",
                    };
                  }
                  else return {
                    status:StatusCodes.BAD_REQUEST,
                    message:'amount to large for supply'
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
    email = typeof email == "string" && email.length > 0 ? email : false;
    productId =
      typeof productId == "string" && productId.length > 0 ? productId : false;
    amount = typeof amount == "number" ? amount : false;
    token = typeof token == "string" && token.length > 0 ? token : false;

    if (email && productId && amount && token) {
      try {
        const user = await data.get("users", email);
        if (user) {
          if (await Token.validate(token, email)) {
            const product = await data.get("products", productId);
            if (product) {
              const basket = await data.get("baskets", email);
              if (basket) {
                if (
                  basket.items.filter((item) => item.product._id === productId)
                    .length > 0
                ) {
                  basket.items.map((item) => {
                    if (item.product._id === productId) {
                      console.log(item);
                      item.amount = item.amount + amount;
                    }
                  });
                } else {
                  basket.items.unshift({ product: product, amount: amount });
                }

                
                if(basket.items.find(item => item.product._id===productId).amount <= product.numberInStock){
                  await data.put("baskets", email, basket);
                  return {
                    status: StatusCodes.OK,
                    message: "item added to basket",
                  };
                }
                else return {
                  status:StatusCodes.BAD_REQUEST,
                  message:'amount to large for supply'
                }

              
              } else {
                if(amount <= product.numberInStock){
                  const _basket = {
                    _id: email,
                    items: [
                      {
                        product: product,
                        amount: amount,
                      },
                    ],
                  };
  
                  await data.post("baskets", _basket);
                  return {
                    status: StatusCodes.OK,
                    message: "item added tp basket",
                  };
                }
                else return {

                  status:StatusCodes.BAD_REQUEST,
                  message:'amount to large for supply'
                }
              
              }
            } else return ResponseErrors.productNotFound;
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async removeItem(productId, token, email) {
    email = typeof email == "string" && email.length > 0 ? email : false;
    productId =
      typeof productId == "string" && productId.length > 0 ? productId : false;

    token = typeof token == "string" && token.length > 0 ? token : false;

    if ((email, productId, token)) {
      try {
        if (await Token.validate(token, email)) {
          const basket = await data.get("baskets", email);
          if (basket) {
            const product = basket.items.find(
              (item) => item.product._id == productId
            );
            if (product) {
              basket.items = basket.items.filter((item) => item !== product);
              await data.put("baskets", email, basket);
              console.log(basket, basket.items, product);
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
