const Services = require("../services");
const Data = require("../Utility-Methods/http");
const { StatusCodes } = require("http-status-codes");
const service = new Services();
const data = new Data();
const Token = require("./token");
const ResponseErrors = require("../Utility-Methods/errors");

module.exports = class User {
  constructor(email, password) {
    this.email = typeof email == "string" && email.length > 0 ? email : false;
    this.password =
      typeof password == "string" && password.length > 0 ? password : false;
  }

  async post() {
    if ((this.email, this.password)) {
      const user = {
        _id: this.email,
        email: this.email,
        password: service.stringHasher(this.password),
        emailVerified: false,
        accountVerified: false,
        timeCreated: Date.now(),
      };
      try {
        const res = await data.post("users", user);

        service.emailCodeSender(user.email, 5, (code) => {
          const codeObject = {
            _id: code,
            code: code,
            user: this.email,
            expiry: Date.now() + 60 * 5 * 1000,
          };
          data.post("codes", codeObject);
        });

        const token = new Token(this.email).create();

        return {
          status: StatusCodes.CREATED,
          message: token,
        };
      } catch (error) {
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "could not create user, user may already exist",
        };
      }
    } else return ResponseErrors.incorrectData;
  }

  static async verifyAccount(
    email,
    token,
    firstName,
    lastName,
    phone,
    address
  ) {
    firstName =
      typeof firstName == "string" && firstName.length > 0 ? firstName : false;
    lastName =
      typeof lastName == "string" && lastName.length > 0 ? lastName : false;
    phone = typeof phone == "string" ? phone : false;
    address = typeof address == "string" ? address : false;
    email = typeof email == "string" ? email : false;
    token = typeof token == "string" ? token : false;

    if (email && firstName && lastName && phone && address) {
      try {
        const res = await data.get("users", email);

        if (res) {
          const isValid = await Token.validate(token, email);
          console.log(isValid);
          if (isValid) {
            res.accountVerified = true;
            res.firstName = firstName;
            res.lastName = lastName;
            res.phone = phone;
            res.address = address;

            await data.put("users", email, res);
            const token = await new Token(email).create();
            return { status: StatusCodes.OK, message: token };
          } else {
            return {
              status: StatusCodes.UNAUTHORIZED,
              message: "invalid token",
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
    } else return ResponseErrors.incorrectData;
  }

  static async verifyEmail(code, email) {
    email = typeof email == "string" ? email : false;
    code = typeof code == "string" ? code : false;
    if (code && email) {
      try {
        const res = await data.get("codes", code);

        if (res && res.user == email && res.expiry > Date.now()) {
          const user = await data.get("users", email);
          if (user) {
            user.emailVerified = true;
            data.put("users", email, user);
            data.delete("codes", code);
            const token = await new Token(email).create();
            return { status: StatusCodes.OK, message: token };
          }
        } else return ResponseErrors.incorrectData;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async getUserDetails(email, token) {
    email = typeof email == "string" ? email : false;
    token = typeof token == "string" ? token : false;
    if (token && email) {
      try {
        const user = await data.get("users", email);
        if (user && Token.validate(token, email)) {
          delete user.password;
          return {
            status: StatusCodes.OK,
            message: user,
          };
        } else {
          return {
            status: StatusCodes.NOT_FOUND,
            message: "user does not exist",
          };
        }
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async getAllProductsBeingSoldByUser(email) {
    email = typeof email == "string" && email.length > 0 ? email : false;
    if (email) {
      if (await data.get("users", email)) {
        const products = await data.getAll("products", { sellerId: email });

        return {
          status: StatusCodes.OK,
          message: products,
        };
      } else return ResponseErrors.userNotFound;
    } else return ResponseErrors.incorrectData;
  }
};
