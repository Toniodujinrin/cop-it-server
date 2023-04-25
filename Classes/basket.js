const Data = require("../Utility-Methods/http");
const Token = require("./token");
const ResponseErrors = require("../Utility-Methods/errors");
const { StatusCodes } = require("http-status-codes");
const data = new Data();
class Basket {
  static async editItemAmount(email, productId, amount, token) {
    email = typeof email == "string" && email.length > 0 ? email : false;
    productId =
      typeof productId == "string" && productId.length > 0 ? productId : false;
    amount = typeof amount == "number" || amount === 0 ? amount : false;
    token = typeof token == "string" && token.length > 0 ? token : false;
    console.log(email, productId, amount, token);
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
                  await data.put("baskets", email, basket);
                  return {
                    status: StatusCodes.OK,
                    message: "basket  updated",
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

                await data.put("baskets", email, basket);
                return {
                  status: StatusCodes.OK,
                  message: "item added to basket",
                };
              } else {
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
            } else return ResponseErrors.productNotFound;
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }
}

module.exports = Basket;
