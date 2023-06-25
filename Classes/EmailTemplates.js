const fs = require('fs')
const path = require('path')
const basePath = path.join(__dirname,"/../statics/")
const Services = require('../services')
const services = new Services()


class Templates{
    static formatConfirmationEmail = (formatConfig)=>{
    const confirmationEmailTemplate = fs.readFileSync(`${basePath}index.html`,'utf-8')
    let interpolatedEmail = confirmationEmailTemplate
    for(let key in formatConfig){
        console.log(key)
        interpolatedEmail = interpolatedEmail.replace(key,formatConfig[key])
    }
    return(interpolatedEmail)

   }

}




module.exports = Templates