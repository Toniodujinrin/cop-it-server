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
      console.log(res);
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
        if (productId) {
          const { publicId, url } = await this.upload("products", image);
          const imageConfig = {
            publicId: publicId,
            url: url,
          };
          product.imageConfig.push(imageConfig);
          data.put("products", productId, product);
          return {
            status: StatusCodes.OK,
            message: "Product created",
          };
        } else return ResponseErrors.productNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  };
}

module.exports = Images;
