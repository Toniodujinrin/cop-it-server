require("dotenv").config;
const crypto = require('crypto')
const nodemailer = require("nodemailer");
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

  emailCodeSender(email, length, callback) {
    const acceptedchars = "1234567890";
    let string = "";
    for (let i = 0; i <= length; i++) {
      string += acceptedchars[Math.floor(Math.random() * acceptedchars.length)];
    }
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.TEST_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let details = {
      from: "Cop it",
      to: email,
      subject: "OTP",
      text: `use this code as your one time password  ${string}`,
      
    };
    

    transporter.sendMail(details, (err) => {
      if (err) {
        console.log("\x1b[34m%s\x1b[0m", err);
      } else {
        console.log("\x1b[34m%s\x1b[0m", `email successfuly sent to ${email}`);
        callback(string);
      }
    });
  }

  confirmationMailSender = (html,email)=>{
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.TEST_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let details = {
      from: "Cop it",
      to: email,
      subject: "OTP",
      text: `use this code as your one time password`,
      html:html
      
    };
    

    transporter.sendMail(details, (err) => {
      if (err) {
        console.log("\x1b[34m%s\x1b[0m", err);
      } else {
        console.log("\x1b[34m%s\x1b[0m", `email successfuly sent to ${email}`);
       }
    });
  
  }
};


