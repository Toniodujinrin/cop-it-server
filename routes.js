const handlers = require("./handlers");

const routes = {
  products: handlers.products,
  users: handlers.users,
  reviews: handlers.reviews,
  "users/verifyEmail": handlers.verifyEmail,
  auth: handlers.auth,
  "users/verifyAccount": handlers.verifyAccount,
  "auth/checkVerified": handlers.checkVerified,
  "users/getUserDetails": handlers.getUserDetails,
  "basket/getBasket": handlers.getBasket,
  "basket/add": handlers.addItemToBasket,
  "basket/editItemAmount": handlers.editItemAmount,
  "users/getAllProductsBeingSoldByUser": handlers.getAllProductsBeingSoldByUser,
  "auth/sendEmailCode": handlers.sendEmailCode,
  "images/uploadProductImage": handlers.uploadProductImage,
  "images/uploadUserImage": handlers.uploadUserImage,
  "users/getProfile": handlers.getProfile,
  "reviews/getAllReviewsAboutUser": handlers.getAllReviewsAboutUser,
  "basket/removeItem": handlers.removeItem,
};

module.exports = routes;
