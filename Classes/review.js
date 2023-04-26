const { StatusCodes } = require("http-status-codes");
const Data = require("../Utility-Methods/http");
const Services = require("../services");
const ResponseErrors = require("../Utility-Methods/errors");
const Token = require("./token");
const _data = new Data();
const service = new Services();
module.exports = class Reviews {
  constructor(review, sellerId, userId, token) {
    this.review =
      typeof review == "string" && review.length > 0 ? review : false;
    this.sellerId =
      typeof sellerId == "string" && sellerId.length > 0 ? sellerId : false;
    this.userId = typeof userId == "string" ? userId : false;
    this.token = token;
  }

  async post() {
    if (this.review && this.sellerId && this.userId) {
      try {
        const seller = await _data.get("users", this.sellerId);
        if (seller) {
          const user = await _data.get("users", this.userId);
          if (user) {
            if (Token.validate(this.token, this.userId)) {
              const review = {
                _id: service.createRandomString(20),
                review: this.review,
                userId: this.userId,
                author: { firstName: user.firstName, lastName: user.lastName },
                datePosted: Date.now(),
                seller: this.sellerId,
              };

              _data.post("reviews", review);
              return { status: StatusCodes.OK, message: "review created " };
            }
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        console.log(error);

        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async getAllReviewsByAUser(email, token) {
    email = typeof email == "string" ? email : false;
    token = typeof token == "string" ? token : false;
    if (email && token) {
      try {
        if (await _data.get("users", email)) {
          if (await Token.validate(token, email)) {
            const reviews = await _data.getAll("reviews", { userId: email });
            return {
              status: StatusCodes.OK,
              message: reviews,
            };
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async getAllReviesAboutUser(email) {
    email = typeof email == "string" ? email : false;
    if (email) {
      try {
        if (await _data.get("users", email)) {
          const reviews = await _data.getAll("reviews", { sellerId: email });
          return {
            status: StatusCodes.OK,
            message: reviews,
          };
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }
};
