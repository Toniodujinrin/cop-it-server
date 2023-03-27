const statusCodes = require("http-status-codes").StatusCodes;
const Service = require("../services");
const Data = require("../http");

const service = new Service();
const data = new Data();
const lengthOfProductId = 21;

module.exports = class Product {
  constructor(
    sellerId,
    name,
    category,
    description,
    isAvailable,
    price,
    numberInStock,
    imageConfig
  ) {
    this.name = typeof name == "string" && name.length > 0 ? name : false;
    this.category =
      typeof category == "string" && category.length > 0 ? category : false;
    this.rating = 0;
    this.description =
      typeof description == "string" && description.length > 0
        ? description
        : false;
    this.isAvailable = typeof isAvailable == "boolean" ? isAvailable : false;
    this.price = typeof price == "number" && price > 0 ? price : false;
    this.numberInStock =
      typeof numberInStock == "number" ? numberInStock : false;
    this.imageConfig = imageConfig;
    this.sellerId =
      typeof sellerId == "string" && sellerId.length > 0 ? sellerId : false;
  }

  async post() {
    if (
      this.category &&
      this.name &&
      this.description &&
      this.isAvailable &&
      this.price &&
      this.numberInStock &&
      this.imageConfig &&
      this.sellerId
    ) {
      const product = {
        _id: service.createRandomString(lengthOfProductId),
        name: this.name,
        category: this.category,
        numberInStock: this.numberInStock,
        description: this.description,
        rating: this.rating,
        price: this.price,
        imageConfig: this.imageConfig,
        isAvailable: this.isAvailable,
        sellerId: this.sellerId,
      };
      try {
        const res = await data.post("products", product);
        return {
          status: statusCodes.CREATED,
          message: "product created successfuly",
        };
      } catch (error) {
        return {
          status: statusCodes.INTERNAL_SERVER_ERROR,
          message: "unable to create product",
        };
      }
    } else {
      return {
        status: statusCodes.BAD_REQUEST,
        message: "data passed is either incorrect or incomplete",
      };
    }
  }

  async get(productId) {
    productId =
      typeof productId == "string" && productId.length == lengthOfProductId
        ? productId
        : false;

    if (productId) {
      try {
        const product = await data.get("products", productId);

        if (product) {
          console.log(product);
          return {
            status: statusCodes.OK,
            message: product,
          };
        } else {
          return {
            status: statusCodes.NOT_FOUND,
            message: "product does not exist",
          };
        }
      } catch (error) {
        return {
          status: statusCodes.INTERNAL_SERVER_ERROR,
          message: "unable to get product",
        };
      }
    } else {
      return {
        status: statusCodes.BAD_REQUEST,
        message: "data passed is either incorrect or incomplete",
      };
    }
  }
};
