const handlers = {};
const Auth = require("./Classes/authentication");
const Product = require("./Classes/product");
const Reviews = require("./Classes/review");
const User = require("./Classes/users");
const Basket = require("./Classes/basket");
const Image = require("./Classes/images");

handlers.products = {};
handlers.reviews = {};
handlers.users = {};
handlers.verifyEmail = {};
handlers.auth = {};
handlers.verifyAccount = {};
handlers.checkVerified = {};
handlers.getUserDetails = {};
handlers.addItemToBasket = {};
handlers.editItemAmount = {};
handlers.getAllProductsBeingSoldByUser = {};
handlers.sendEmailCode = {};
handlers.uploadProductImage = {};
handlers.uploadUserImage = {};
handlers.getBasket = {};
handlers.getProfile = {};
handlers.getAllReviewsAboutUser = {};
handlers.removeItem = {};
handlers.googleAuthiticate ={}

handlers.products.post = async (data, callback) => {
  const _data = data.payload;
  console.log(_data.email);
  const token = data.headers.token;

  const res = await new Product(
    _data.email,
    _data.name,
    _data.category,
    _data.description,
    _data.price,
    _data.numberInStock,

    token
  ).post();
  callback(res.status, { data: res.message });
};
handlers.products.get = async (data, callback) => {
  const productId = data.query.productId;
  const res = await new Product().get(productId);
  callback(res.status, { data: res.message });
};
handlers.products.delete = async (data, callback) => {
  const productId = data.query.productId;
  const res = await Product.delete(productId);
  callback(res.status, { data: res.message });
};

handlers.reviews.post = async (data, callback) => {
  const _data = data.payload;
  const token = data.headers.token;
  const res = await new Reviews(
    _data.review,
    _data.sellerId,
    _data.userId,
    token
  ).post();
  callback(res.status, { data: res.message });
};
handlers.getAllReviewsAboutUser.get = async (data, callback) => {
  const email = data.query.email;
  const res = await Reviews.getAllReviesAboutUser(email);
  callback(res.status, { data: res.message });
};
handlers.users.post = async (data, callback) => {
  const _data = data.payload;
  const res = await new User(_data.email, _data.password).post();
  callback(res.status, { data: res.message });
};
handlers.users.get = async (data, callback) => {
  const email = data.query.email;
  const token = data.headers.token;

  const res = await User.get(email, token);
  callback(res.status, { data: res.message });
};
handlers.getProfile.get = async (data, callback) => {
  const email = data.query.email;
  const res = await User.getProfile(email);
  callback(res.status, { data: res.message });
};

handlers.verifyEmail.post = async (data, callback) => {
  const _data = data.payload;
  const res = await User.verifyEmail(_data.code, _data.email);
  callback(res.status, { data: res.message });
};

handlers.auth.post = async (data, callback) => {
  const _data = data.payload;
  const res = await new Auth(_data.email, _data.password).authorize();
  callback(res.status, { data: res.message });
};

handlers.googleAuthiticate.post = async(data,callback)=>{
  const email = data.payload.email
  const res = await Auth.googleAuthenticate(email)
  callback(res.status,{data:res.message})
}

handlers.verifyAccount.post = async (data, callback) => {
  const _data = data.payload;
  const token = data.headers.token;
  const res = await User.verifyAccount(
    _data.email,
    token,
    _data.firstName,
    _data.lastName,
    _data.phone,
    _data.address
  );
  callback(res.status, { data: res.message });
};

handlers.checkVerified.get = async (data, callback) => {
  const email = data.query.email;
  const token = data.headers.token;
  const res = await Auth.checkVerified(email, token);
  callback(res.status, { data: res.message });
};
handlers.sendEmailCode.post = async (data, callback) => {
  const email = data.query.email;

  const res = await Auth.sendEmailCode(email);
  callback(res.status, { data: res.message });
};

handlers.getUserDetails.get = async (data, callback) => {
  const email = data.query.email;
  const token = data.headers.token;
  const res = await User.getUserDetails(email, token);
  callback(res.status, { data: res.message });
};

handlers.getBasket.get = async (data, callback) => {
  const email = data.query.email;
  const token = data.headers.token;
  const res = await Basket.getBasket(email, token);
  callback(res.message, { data: res.message });
};

handlers.addItemToBasket.post = async (data, callback) => {
  const _data = data.payload;
  const token = data.headers.token;
  const res = await Basket.addItem(
    _data.email,
    _data.productId,
    _data.amount,
    token
  );
  callback(res.status, { data: res.message });
};
handlers.removeItem.post = async (data, callback) => {
  const _data = data.payload;
  const token = data.headers.token;
  const res = await Basket.removeItem(_data.productId, token, _data.email);

  callback(res.status, { data: res.message });
};
handlers.editItemAmount.post = async (data, callback) => {
  const _data = data.payload;
  const token = data.headers.token;
  const res = await Basket.editItemAmount(
    _data.email,
    _data.productId,
    _data.amount,
    token
  );
  callback(res.status, { data: res.message });
};

handlers.getAllProductsBeingSoldByUser.get = async (data, callback) => {
  const email = data.query.email;
  const res = await User.getAllProductsBeingSoldByUser(email);
  callback(res.status, { data: res.message });
};

handlers.uploadProductImage.post = async (data, callback) => {
  const _data = data.payload;
  const productId = _data.productId;
  const image = _data.image;
  const res = await Image.uploadProductImage(image, productId);
  callback(res.status, { data: res.message });
};

handlers.uploadUserImage.post = async (data, callback) => {
  const _data = data.payload;
  const email = _data.email;
  const image = _data.image;
  const token = data.headers.token;
  const res = await Image.uploadUserImage(image, email, token);
  callback(res.status, { data: res.message });
};

module.exports = handlers;
