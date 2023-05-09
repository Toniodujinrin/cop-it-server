const { StatusCodes } = require("http-status-codes");
const ResponseErrors = require("../Utility-Methods/errors");
const Data = require("../Utility-Methods/http");
const Token = require("./token");

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
    productId = typeof productId == "string" ? productId : false;
    image = typeof image == "string" ? image : false;
    if (productId && image) {
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

  static uploadUserImage = async (image, email, token) => {
    email = typeof email == "string" ? email : false;
    image = typeof image == "string" ? image : false;
    console.log(image, token, email);
    if (productId && image) {
      try {
        const user = await data.get("users", email);
        if (await Token.validate(token, email)) {
          const imageConfig = await this.upload("users", image);
          user.imageConfig = imageConfig;
          await data.put("users", email, user);
          return {
            status: StatusCodes.OK,
            message: product,
          };
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  };
}

module.exports = Images;
