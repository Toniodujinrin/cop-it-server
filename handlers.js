const handlers = {};
const Auth = require("./Classes/authentication");
const Product = require("./Classes/product");
const Reviews = require("./Classes/review");
const User = require("./Classes/users");
const Basket = require("./Classes/basket");
const Image = require("./Classes/images");
const Checkout = require("./Classes/checkout");
const Orders = require("./Classes/orders");

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
handlers.getFeatured = {}
handlers.getByCategory = {}
handlers.getByName = {}
handlers.searchUser = {}
handlers.checkout = {}
handlers.guestCheckout = {}
handlers.processCheckout = {}
handlers.orders = {}

handlers.products.post = async (data, callback) => {
  const _data = data.payload;

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
handlers.products.put = async(data,callback)=>{
  const _data = data.payload;
  const token = data.headers.token;
  const res = await Product.put(
    _data.name,_data.productId,_data.category, _data.numberInStock, _data.description, _data.price, _data.isAvailable,token, _data.sellerId
  )
  callback(res.status,{data:res.message})

}
handlers.products.delete = async (data, callback) => {
  const productId = data.query.productId;
  const res = await Product.delete(productId);
  callback(res.status, { data: res.message });
};
handlers.getFeatured.get = async (data,callback)=>{
  const res = await Product.getFeatured();
  callback(res.status,{data:res.message})
}
handlers.getByCategory.get = async (data,callback)=>{
  const category = data.query.category
  const res = await Product.getByCategory(category)
  callback(res.status,{data:res.message})
}
handlers.getByName.get = async (data,callback)=>{
  const name = data.query.name
  const res = await Product.getByName(name)
  callback(res.status,{data:res.message})
}

handlers.reviews.post = async (data, callback) => {
  const _data = data.payload;
  const token = data.headers.token;
  const res = await new Reviews(
    _data.review,
    _data.sellerId,
    _data.userId,
    token,
    _data.rating
  ).post();
  callback(res.status, { data: res.message });
};
handlers.getAllReviewsAboutUser.get = async (data, callback) => {
  const email = data.query.email;
  const res = await Reviews.getAllReviesAboutUser(email);
  callback(res.status, { data: res.message });
};
handlers.reviews.delete = async(data,callback)=>{
  const token = data.headers.token; 
  const reviewId = data.query.reviewId
  const res = await Reviews.deletePersonReview(token,reviewId)
  callback(res.status,{data:res.message})
}
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
handlers.searchUser.get = async (data,callback)=>{
  const searchString = data.query.searchString
  const res = await User.searchProfiles(searchString)
  callback(res.status,{data:res.message})
}

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

handlers.checkout.post = async(data, callback)=>{
  const _data = data.payload
  const token = data.headers.token
  const res = await new Checkout(_data.products,token,_data.email).post()
  callback(res.status,{data:res.message})

}
handlers.checkout.get = async (data,callback)=>{
  const email = data.query.email
  const token = data.headers.token
  const res = await  Checkout.get(token,email)
  callback(res.status, {data:res.message})

}

handlers.processCheckout.post = async(data,callback)=>{
  const _data = data.payload
  const token = data.headers.token
  const res = await Checkout.processCheckout(_data.products,_data.email,token)
  callback(res.status,{data:res.message})
}

handlers.guestCheckout.post = async (data,callback)=>{
  const products = data.payload.products
  const res = await Checkout.guestCheckout(products)
  callback(res.status,{data:res.message})
}

handlers.guestCheckout.get = async(data,callback)=>{
  const checkoutId = data.query.checkoutId
  const res = await Checkout.getGuestCheckout(checkoutId)
  callback(res.status,{data:res.message})
}

handlers.orders.get = async(data,callback)=>{
  const email = data.query.email
  const token = data.headers.token
  const res = await Orders.get(token,email)
  callback(res.status, {data:res.message})
}

module.exports = handlers;
