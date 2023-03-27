const { StatusCodes } = require("http-status-codes");
const Data = require("../http");
const Services = require("../services");
const _data = new Data();
const service = new Services();
module.exports = class Reviews {
  constructor(review, productId, userId) {
    this.review =
      typeof review == "string" && review.length > 0 ? review : false;
    this.productId = typeof productId == "string" ? productId : false;
    this.userId = typeof userId == "string" ? userId : false;
  }

  async post() {
    //check if the user is a valid user and if the product is a valid product
    try {
      const product = await _data.get("products", this.productId);
      if (product) {
        const user = await _data.get("users", this.userId);
        if (user) {
          const review = {
            _id: service.createRandomString(20),
            review: this.review,
            author: { firstName: user.firstName, lastName: user.lastName },
            datePosted: new Date.now(),
          };

          _data.post("reviews", review);
        }
      } else {
        return {
          status: StatusCodes.NOT_FOUND,
          message: "product does not exist",
        };
      }
    } catch (error) {
      console.log(error);

      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "could not create review",
      };
    }
  }
};
