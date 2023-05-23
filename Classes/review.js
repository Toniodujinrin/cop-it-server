const { StatusCodes } = require("http-status-codes");
const Data = require("../Utility-Methods/http");
const Services = require("../services");
const ResponseErrors = require("../Utility-Methods/errors");
const Token = require("./token");
const _data = new Data();
const service = new Services();
module.exports = class Reviews {
  constructor(review, sellerId, userId, token,rating) {
    this.review =
      typeof review == "string" && review.length > 0 ? review : false;
    this.sellerId =
      typeof sellerId == "string" && sellerId.length > 0 ? sellerId : false;
    this.userId = typeof userId == "string" ? userId : false;
    this.token = token;
    this.rating = typeof rating =='number'?rating:false 
  }

  async post() {
    if (this.review && this.sellerId && this.userId, this.rating) {
      try {
        const seller = await _data.get("users", this.sellerId);
        if (seller) {
          const user = await _data.get("users", this.userId);
          if (user) {
            if (Token.validate(this.token, this.userId)) {
              const review = {
                _id: service.createRandomString(20),
                review: this.review,
                userId: this.userId,
                rating: this.rating,
                datePosted: Date.now(),
                seller: this.sellerId,
              };

              _data.post("reviews", review);
              return { status: StatusCodes.OK, message: "review created " };
            }
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        console.log(error);

        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async reviewProduct(productId,email,token, review, rating){
    review =typeof review == "string" && review.length > 0 ? review : false;
    rating = typeof rating=='number'?rating:false
    productId = typeof productId == "string" ?productId : false;
    token = typeof token =='string'?token:false 
    email = typeof email =='string'?email:false 
    if(review,productId,token,email,rating){
      try {
        const user = await _data.get('users',email)
        if(user){
          const product = await _data.get('products',productId)
        if(product){
          if(Token.validate(token,email)){
            const productReview ={
              _id:service.createRandomString(20),
              review:review,
              rating:rating,
              productId:productId,
              userId:email,
              author:{
                firstName:user.firstName,
                lastName:user.lastName,
                imageConfig:user.imageConfig

              },
              datePosted:Date.now()
            }
            _data.post('productReviews',productReview)

          }else return ResponseErrors.invalidToken


          } else return ResponseErrors.productNotFound

        }else return ResponseErrors.userNotFound
        
      } catch (error) {
        return ResponseErrors.serverError
        }

    }
    else return ResponseErrors.incorrectData


  }
  // static async getAllReviewsAboutProduct(productId){
  //   productId = typeof productId == "string" ?productId : false;
  //   if(productId){
  //     try {
  //       const product = await 
  //     } catch (error) {
        
  //     }
  //   }
  //   else return ResponseErrors.incorrectData
    
  // }
  static async getAllReviewsByAUser(email, token) {
    email = typeof email == "string" ? email : false;
    token = typeof token == "string" ? token : false;
    if (email && token) {
      try {
        if (await _data.get("users", email)) {
          if (await Token.validate(token, email)) {
            const reviews = await _data.getAll("reviews", { userId: email });
            return {
              status: StatusCodes.OK,
              message: reviews,
            };
          } else return ResponseErrors.invalidToken;
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }

  static async getAllReviesAboutUser(email) {
    email = typeof email == "string" ? email : false;
    if (email) {
      try {
        const user = await _data.get("users", email)
        if (user) {
          
          let  reviews = await _data.getAll("reviews", { seller: email });
          
          const _reviews = reviews.map(
            async (review) =>{

           const author = await _data.get('users', review.userId) 
           
           review.author ={
            firstName:author.firstName,
            lastName:author.lastName,
            imageConfig:author.imageConfig
           

          }})
          
          await Promise.all(_reviews)
         
          return {
            status: StatusCodes.OK,
            message: reviews,
          };
        } else return ResponseErrors.userNotFound;
      } catch (error) {
        console.log(error)
        return ResponseErrors.serverError;
      }
    } else return ResponseErrors.incorrectData;
  }
};
