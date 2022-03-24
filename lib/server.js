var http=require('http')
var config=require('./config')
var unifiedserver=require('./unifiedServer')

var server={};


server.httpServer=http.createServer((req,res)=>{
    unifiedserver(req,res)
})



server.init=function(){
    server.httpServer.listen(config.http,()=>{
        console.log('Server Listening on port '+config.http+' in '+config.envName+' environment')
    })
}

module.exports=server

