const Token = require("./token");
const Data = require("../Utility-Methods/http");
const { StatusCodes } = require("http-status-codes");
const Services = require("../services");
const ResponseErrors = require("../Utility-Methods/errors");
const Validator = require('../Utility-Methods/validator')
const data = new Data();
const service = new Services();

module.exports = class Auth {
  constructor(user, password) {
    this.user = user
    this.password = password
  }

  async authorize() {
    if (Validator.stringValidate([this.user, this.password])) {
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
        console.log(error)
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "could not create token",
        };
      }
    }
    else return ResponseErrors.incorrectData
  }

  static async googleAuthenticate(email){
  if(Validator.stringValidate([email])){
    try {

      const user = await data.get('users',email)
    if(user){
      const token = await new Token(email).create()
      return {
        status:StatusCodes.OK,
        message:token
      }
    }
    else return ResponseErrors.userNotFound
    } catch (error) {
      
       return ResponseErrors.serverError
    }
    
  }
  else return ResponseErrors.incorrectData

  }

  static checkVerified = async (email, token) => {
    if (Validator.stringValidate([email,token])) {
      try {
        const user = await data.get("users", email);
        if (user) {
          const isTokenValid = await Token.onlyTokenValidate(token, email);
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

  static sendEmailCode = async (email) => {
    if (Validator.stringValidate([email])) {
      try {
        const user = await data.get("users", email);
        if (user) {
          
          service.emailCodeSender(user.email, 5, (code) => {
            const codeObject = {
              _id: code,
              code: code,
              user: email,
              expiry: Date.now() + 60 * 5 * 1000,
            };
            data.post("codes", codeObject);
          });
          return {
            status: StatusCodes.OK,
            message: "Code Sent",
          };
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  };
};
