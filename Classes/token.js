const Services = require("../services");
const service = new Services();
const Data = require("../Utility-Methods/http");
const data = new Data();

module.exports = class Token {
  constructor(user) {
    this.user = user;
  }

  async create() {
    const tokenObject = {
      _id: service.createRandomString(25),
      expiry: Date.now() + 24 * 60 * 60 * 1000,
      user: this.user,
    };
    try {
      await data.post("tokens", tokenObject);

      return tokenObject;
    } catch (error) {
      console.log(error);
      throw new Error("could not create token");
    }
  }

  static async validate(token, user) {
    try {
      const res = await data.get("tokens", token);

      if (res && res.user == user && res.expiry > Date.now()) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new Error("an error occure validating token");
    }
  }
};
