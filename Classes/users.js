const Services = require("../services");
const Data = require("../Utility-Methods/http");
const { StatusCodes } = require("http-status-codes");
const service = new Services();
const data = new Data();
const Token = require("./token");
const ResponseErrors = require("../Utility-Methods/errors");
const { invalidToken } = require("../Utility-Methods/errors");
const Validator = require("../Utility-Methods/validator");

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
        imageConfig: {},
      };
      try {
        await data.post("users", user);
        service.emailCodeSender(user.email, 5, (code) => {
          const codeObject = {
            _id: code,
            code: code,
            user: this.email,
            expiry: Date.now() + 60 * 5 * 1000,
          };
          data.post("codes", codeObject);
        });

        const token = await new Token(this.email).create();

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
  static async get(email, token) {
     if (Validator.stringValidate([email,token])) {
      if (await Token.onlyTokenValidate(token, email)) {
        const user = await data.get("users", email);
        if (user) {
          return {
            status: StatusCodes.OK,
            message: user,
          };
        } else return ResponseErrors.userNotFound;
      } else return ResponseErrors.invalidToken;
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
    if(Validator.stringValidate([email,token,firstName,lastName,phone,address])) {
      try {
        const res = await data.get("users", email);

        if (res) {
          
          
          if (await Token.onlyTokenValidate(token, email)) {
            res.accountVerified = true;
            res.firstName = firstName;
            res.lastName = lastName;
            res.phone = phone;
            res.address = address;

            await data.put("users", email, res);
            const token = await new Token(email).create();
            return { status: StatusCodes.OK, message: token };
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        console.log(error);
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async verifyEmail(code, email) {
    if (Validator.stringValidate([code,email])) {
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

  static async put(email,token,firstName,lastName,phone, address){
    if(Validator.stringValidate([email,token]) && (Validator.stringValidate([phone]) || Validator.stringValidate([lastName]) || Validator.stringValidate([firstName]) || Validator.stringValidate([address]))){
      try {
        if(await Token.validate(token,email)){
          const user = await data.get('users',email)
          if(firstName) user.firstName = firstName
          if(lastName) user.lastName = lastName
          if(phone) user.phone = phone
          if(address) user.address = address 
          await data.put('users',email,user)
          return{
            status:StatusCodes.OK,
            message:'User Information Update'
          }
          }
          
        else return ResponseErrors.invalidToken
      } catch (error) {
        return ResponseErrors.serverError
      }
    }
    else return ResponseErrors.incorrectData
}

static async delete(email, token){
  if(Validator.stringValidate([email,token])){
    try {
      if(await Token.validate(token,email)){
          //delete everything concerning user such as products ,baskets, checkouts, reviews, do not delete orders for record purposes 
          //delete checkout
          await data.delete('checkout',email)
          await data.delete('baskets', email)
          const products = await data.getAll('products',{sellerId:email})
          const _resolve1 = products.map(async (product)=> await  data.delete('products',product._id))
          const reviews = await data.getAll('reviews',{seller:email})
          const _resolve2 = reviews.map(async (review)=> await data.delete('reviews',review._id) )
          await Promise.all(_resolve1); await Promise.all(_resolve2)
          await data.delete('users',email)
          return({
            status:StatusCodes.OK,
            message:'user profile deleted'
          })
          
      }
      else return ResponseErrors.invalidToken
    } catch (error) {
      return ResponseErrors.serverError
    }
  }
  else return ResponseErrors.incorrectData
}

static async getAllProductsBeingSoldByUser(email) {
    if (Validator.stringValidate([email])) {
      if (await data.get("users", email)) {
        const products = await data.getAll("products", { sellerId: email });
        return {
          status: StatusCodes.OK,
          message: products,
        };
      } else return ResponseErrors.userNotFound;
    } else return ResponseErrors.incorrectData;
  }
  static async searchProfiles(searchString){
    searchString = typeof searchString == 'string'?searchString:false
    if(searchString){
      searchString = searchString.toLowerCase()
      try {
        
   
      let  users = await data.getAll('users',{})
      users = users.filter(user =>{
        if(user.accountVerified && user.emailVerified){
          return( user.email.toLowerCase().includes(searchString) || user.firstName.toLowerCase().includes(searchString)|| user.lastName.toLowerCase().includes(searchString))
        }
       
      }
      )
         
      return{
        status:StatusCodes.OK, 
        message:users

      }
       } catch (error) {
        console.log(error)
        return ResponseErrors.serverError
        
      }
    }
    else return ResponseErrors.incorrectData
  }

  static async getProfile(email) {
    email = typeof email == "string" && email.length > 0 ? email : false;
    if (email) {
      const user = await data.get("users", email);

      if (user && user.emailVerified && user.accountVerified) {
        const profile = {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          imageConfig: user.imageConfig,
        };
        return {
          status: StatusCodes.OK,
          message: profile,
        };
      } else return ResponseErrors.userNotFound;
    } else return ResponseErrors.incorrectData;
  }
};
