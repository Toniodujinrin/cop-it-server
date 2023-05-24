const statusCodes = require("http-status-codes").StatusCodes;
const Service = require("../services");
const Data = require("../Utility-Methods/http");
const ResponseErrors = require("../Utility-Methods/errors");
const Token = require("./token");
const Image = require("./images");

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
    this.name = typeof name == "string" && name.length > 0 ? name : false;
    this.category =
      typeof category == "string" && category.length > 0 ? category : false;
    this.rating = 0;
    this.description =
      typeof description == "string" && description.length > 0
        ? description
        : false;
    this.isAvailable = true;
    this.price = typeof price == "number" && price > 0 ? price : false;
    this.numberInStock =
      typeof numberInStock == "number" ? numberInStock : false;

    this.sellerId =
      typeof email == "string" && email.length > 0 ? email : false;
    this.email = typeof email == "string" && email.length > 0 ? email : false;
    this.token = typeof token == "string" && token.length > 0 ? token : false;
  }

  async post() {
    if (
      this.category &&
      this.name &&
      this.description &&
      this.isAvailable &&
      this.price &&
      this.numberInStock &&
      this.sellerId &&
      this.email &&
      this.token
    ) {
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
            const res = await data.post("products", product);
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
    productId = typeof productId == "string" ? productId : false;

    if (productId) {
      try {
        const product = await data.get("products", productId);

        if (product) {
          console.log(product);
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
    productId = typeof productId == "string" ? productId : false;
    if (productId) {
      try {
        const product = await data.get('products', productId)
        if (product) {
          await data.delete("products", productId);
          await Image.deleteImage(product.imageConfig[0].publicId)
          const baskets = await data.getAll('baskets',{})
          console.log(baskets)
          baskets.forEach(basket =>{
           
            const newBasket = basket.items.filter(item => item.product._id !== productId )
           
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

  
};
