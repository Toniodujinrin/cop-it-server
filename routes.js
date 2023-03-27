const handlers = require("./handlers");

const routes = {
  products: handlers.products,
  users: handlers.users,
  reviews: handlers.reviews,
};

module.exports = routes;
