const crypto = require('crypto')
const nodemailer = require("nodemailer");
const axios = require("axios").default
module.exports = class Services {
  createRandomString(length) {
    const chars = "qwertyuiopasdfghjklzxcvbnm1234567890";
    let string = "";
    for (let i = 0; i <= length; i++) {
      const randomLetter = chars[Math.floor(Math.random() * chars.length)];
      string += randomLetter;
    }
    return string;
  }

  stringHasher(str) {
    let hash = crypto
      .createHmac("sha256", process.env.HASHING_SECRET)
      .update(str)
      .digest("hex");
    return hash;
  }

  async emailCodeSender(email, length, callback) {
    const acceptedchars = "1234567890";
    let string = "";
    for (let i = 0; i <= length; i++) {
      string += acceptedchars[Math.floor(Math.random() * acceptedchars.length)];
    }
    const payload = {
      receiver:email,
      subject:"OTP for Sign up",
      from:"Cop it",
      text:`use this code as your one time password ${string}`,
      
    }
    try {

      await axios.post("http://13.48.25.52:8081/send", payload)
      callback(string)
      console.log("\x1b[34m%s\x1b[0m", `email successfuly sent to ${email}`);
    } catch (error) {
       console.log("\x1b[34m%s\x1b[0m", `failed to send email to ${email}`);
      
    }
    
  }

  confirmationMailSender = async (html,email)=>{
    const payload={
      receiver:email,
      subject:"Order Confirmation",
      from:"Cop it",
      text:"Confirmation for order",
      html:html
    }
    try {
      await axios.post("http://13.48.25.52:8081/sendHtml",payload)
      console.log("\x1b[34m%s\x1b[0m", `order confirmation successfuly sent to ${email}`);

    } catch (error) {
      console.log("\x1b[34m%s\x1b[0m",`Failed to send order confirmation to ${email} `)
    }
    
  }
};


