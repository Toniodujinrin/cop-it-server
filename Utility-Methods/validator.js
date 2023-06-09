module.exports = class Validator {

    static stringValidate (stringList){
        let validity = true
        for(const item of stringList){
          if(!(typeof(item)=='string'&& item.length>0)){
            validity= false
          }
        }
        return validity
    }

    static numberValidator(numberList){
        let validity = true
        for(const item of numberList){
          if(!(typeof(item)=='number')){
            validity= false
          }
        }
        return validity
    }
};


