const { StatusCodes } = require("http-status-codes");
const ResponseErrors = require("../Utility-Methods/errors");
const Data = require("../Utility-Methods/http");
const Token = require("./token");
const Validator = require('../Utility-Methods/validator')
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const data = new Data();

class Images {
  static upload = async (folder, image) => {
    try {
      const res = await cloudinary.uploader.upload(image, {
        folder: folder,
      });

      return { publicId: res.public_id, url: res.secure_url };
    } catch (err) {
      console.log(err);
    }
  };

  static uploadProductImage = async (image, productId) => {
    if (Validator.stringValidate([productId, image])) {
      try {
        const product = await data.get("products", productId);
        if (product) {
          const imageConfig = await this.upload("products", image);

          product.imageConfig.unshift(imageConfig);
          await data.put("products", productId, product);
          return {
            status: StatusCodes.OK,
            message: product,
          };
        } else return ResponseErrors.productNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  };
  static deleteImage = async (publicId)=>{
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.log('cloudinary',error)
    }
  }
  static uploadUserImage = async (image, email, token) => {
    if (Validator.stringValidate([email,image])) {
      try {
        
        if (await Token.validate(token, email)) {
          const user = await data.get("users", email);
          if(user.imageConfig.publicId){
            await this.deleteImage(user.imageConfig.publicId)
          }
          const imageConfig = await this.upload("users", image);
          user.imageConfig = imageConfig;
          await data.put("users", email, user);
          return {
            status: StatusCodes.OK,
            message: user,
          };
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        console.log(error);
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  };
}

module.exports = Images;
