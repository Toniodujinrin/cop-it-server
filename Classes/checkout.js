
class Checkout{
    
    constructor(products,token ,email){
        this.email = typeof email == 'string'?email:false 
        this.token = typeof token == 'string'?token:false
        this.products = typeof products == 'object' && products instanceof Array? products: false
    }

    async post(){
        if(this.email&&this.products&&this.token){

        }
        else return 

    }
}