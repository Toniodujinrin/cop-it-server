const { StatusCodes } = require("http-status-codes");

module.exports = class ResponseErrors {
  static serverError = {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "a server error occured ",
  };

  static incorrectData = {
    status: StatusCodes.BAD_REQUEST,
    message: "data passed is either incorrect or incomplete",
  };
  static invalidToken = {
    status: StatusCodes.UNAUTHORIZED,
    message: "token invalid",
  };
  static productNotFound = {
    status: StatusCodes.NOT_FOUND,
    message: "product not found",
  };
  static userNotFound = {
    status: StatusCodes.NOT_FOUND,
    message: "user not found",
  };
  static reviewNotFound = {
    status: StatusCodes.NOT_FOUND,
    message: "review not found",
  };
  static basketEmpty = {
    status: StatusCodes.NOT_FOUND,
    message: "user does not have a basket",
  };
  static checkoutNotFound = {
    status: StatusCodes.NOT_FOUND,
    message: "checkout not found",
  };

  static invalidCheckout = {
    status:StatusCodes.BAD_REQUEST,
    message:'Invalid checkout'
  }
  static amountExceeded = {
    status:StatusCodes.BAD_REQUEST,
    message:'amount to large for supply'
  }
  
};
