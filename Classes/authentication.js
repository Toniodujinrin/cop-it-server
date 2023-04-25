const Token = require("./token");
const Data = require("../Utility-Methods/http");
const { StatusCodes } = require("http-status-codes");
const Services = require("../services");
const ResponseErrors = require("../Utility-Methods/errors");

const data = new Data();
const service = new Services();

module.exports = class Auth {
  constructor(user, password) {
    this.user = typeof user == "string" && user.length > 0 ? user : false;
    this.password =
      typeof password == "string" && password.length > 0 ? password : false;
  }

  async authorize() {
    if ((this.user, this.password)) {
      try {
        const res = await data.get("users", this.user);
        const hashedPassword = service.stringHasher(this.password);
        if (res && hashedPassword == res.password) {
          const tokenRes = await new Token(this.user).create();
          return { status: StatusCodes.CREATED, message: tokenRes };
        } else {
          return {
            status: StatusCodes.UNAUTHORIZED,
            message: "email password combination incorrect",
          };
        }
      } catch (error) {
        console.log(error);
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "could not create token",
        };
      }
    }
  }

  static checkVerified = async (email, token) => {
    token = typeof token == "string" ? token : false;
    email = typeof email == "string" ? email : false;
    if (email && token) {
      try {
        const user = await data.get("users", email);
        if (user) {
          const isTokenValid = await Token.validate(token, email);
          if (isTokenValid) {
            const returnObject = {
              email: user.email,
              accountVerified: user.accountVerified,
              emailVerified: user.emailVerified,
            };
            return {
              status: StatusCodes.OK,
              message: returnObject,
            };
          } else {
            return {
              status: StatusCodes.UNAUTHORIZED,
              message: "token invalid",
            };
          }
        } else {
          return {
            status: StatusCodes.NOT_FOUND,
            message: "user does not exist",
          };
        }
      } catch (error) {
        console.log(error);
        return ResponseErrors.serverError;
      }
    } else {
      return ResponseErrors.incorrectData;
    }
  };
};
