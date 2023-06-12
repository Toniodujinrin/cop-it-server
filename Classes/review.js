const { StatusCodes } = require("http-status-codes");
const Data = require("../Utility-Methods/http");
const Services = require("../services");
const ResponseErrors = require("../Utility-Methods/errors");
const Validator = require('../Utility-Methods/validator')
const Token = require("./token");
const _data = new Data();
const service = new Services();
module.exports = class Reviews {
  constructor(review, sellerId, userId, token,rating) {
 this.rating = rating;
  this.sellerId = sellerId;
   this.userId = userId;
  this.token = token; 
 this.review = review
  }

  async post() {
   
    if (Validator.numberValidator([this.rating])&& Validator.stringValidate([this.sellerId,this.userId, this.review, this.token]) ) {
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

              await _data.post("reviews", review);
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

  static async deletePersonReview(token, reviewId){
    token = typeof token =='string'?token:false 
    
    reviewId = typeof reviewId  =='string'?reviewId:false 

    if(token && reviewId){
     const _review = await _data.get('reviews', reviewId)
     if(_review){
        if(await Token.validate(token, _review.userId)){
          await _data.delete('reviews',reviewId)
          return{
            status:StatusCodes.OK,
            message:'review deleted'
          }
        }
        else return ResponseErrors.invalidToken
     }
     else return ResponseErrors.reviewNotFound

    }
    else return ResponseErrors.incorrectData
  
  }

  static async reviewProduct(productId,email,token, review, rating){
   if(Validator.stringValidate([review,productId,token,email]) && Validator.numberValidator([rating])){
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
    if (Validator([email,token])) {
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
    if (Validator.stringValidate([email])) {
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
