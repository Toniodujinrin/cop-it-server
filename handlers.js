const handlers = {};
const Product = require("./Classes/product");

handlers.products = {};

handlers.products.post = async (data, callback) => {
  const _data = data.payload;
  const res = await new Product(
    _data.sellerId,
    _data.name,
    _data.category,
    _data.description,
    _data.isAvailable,
    _data.price,
    _data.numberInStock,
    _data.imageConfig
  ).post();
  callback(res.status, { message: res.message });
};
handlers.products.get = async (data, callback) => {
  const productId = data.query.productId;
  const res = await new Product().get(productId);
  callback(res.status, { message: res.message });
};

module.exports = handlers;
