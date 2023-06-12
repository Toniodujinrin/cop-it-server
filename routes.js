const handlers = require("./handlers");

const routes = {
  products: handlers.products,
  users: handlers.users,
  reviews: handlers.reviews,
  "users/verifyEmail": handlers.verifyEmail,
  auth: handlers.auth,
  "users/verifyAccount": handlers.verifyAccount,
  'users/searchUser':handlers.searchUser,
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
  'auth/googleAuthenticate':handlers.googleAuthiticate,
  'products/getFeatured':handlers.getFeatured,
  'products/getByCategory':handlers.getByCategory,
  'products/getByName':handlers.getByName,
  'checkout':handlers.checkout,
  'guestCheckout':handlers.guestCheckout,
  'checkout/processCheckout':handlers.processCheckout,
  'orders':handlers.orders
};

module.exports = routes;
