const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
}

module.exports = Images;
