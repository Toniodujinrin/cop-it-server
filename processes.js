const Data = require('./Utility-Methods/http')
const data = new Data()
class Processes{
  
    static async init(){
        console.log('processes started...')
        async function  tokenProcesses(){
            const tokens = await data.getAll('tokens')
            const _token = tokens.map( async token=>{
              if(token.expiry < Date.now()){
                  await data.delete('tokens',token._id)
            }
            })
          await Promise.all(_token)
        }

        async function  codesProcesses(){
            
            const codes = await data.getAll('codes')
            const _codes= codes.map( async code=>{
              if(code.expiry < Date.now()){
                  await data.delete('codes',code._id)
            }
            })
          await Promise.all(_codes)
        }
        
        await codesProcesses()
        await tokenProcesses()
        
        setInterval(()=>{
          codesProcesses()
          tokenProcesses()
        },1000*30)
      
    }

     
    

    
}

module.exports = Processes