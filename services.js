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
};
