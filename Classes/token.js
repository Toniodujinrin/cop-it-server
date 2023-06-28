const Services = require("../services");
const service = new Services();
const Data = require("../Utility-Methods/http");
const data = new Data();

module.exports = class Token {
  constructor(user) {
    this.user = user;
  }

  async create() {
    const _user = await data.get('users',this.user)

    const tokenObject = {
      _id: service.createRandomString(25),
      expiry: Date.now() + 24 * 60 * 60 * 1000,
      user: this.user,
      isVerified:_user.emailVerified &&_user.accountVerified
    };
    try {
      await data.post("tokens", tokenObject);

      return tokenObject;
    } catch (error) {
      console.log(error);
      throw new Error("could not create token");
    }
  }

  static async validate(token, email) {
    try {
      const res = await data.get("tokens", token);

      if (res && res.user == email && res.expiry > Date.now()) {
        const user = await data.get('users',email)
        if(user&& user.emailVerified && user.accountVerified){
          return true;
        }
        else{
          return false 
        }
        
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false
    }
  }

  static async onlyTokenValidate(token, email){
    try {
      const res = await data.get("tokens", token);
      if (res && res.user == email && res.expiry > Date.now()) {
        return true 
        
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false

   }
  }
};
