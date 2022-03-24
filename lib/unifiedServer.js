const { type } = require('os');
var url=require('url')
var StringDecoder=require('string_decoder').StringDecoder;
var helpers=require('./helpers')
var routes=require('./routes')
var handler=require('./handler')




var unifiedServer=function(req,res){
    var parseUrl=url.parse(req.url,true);
    var headers=req.headers;
    var path=parseUrl.pathname;
    var trimPath=path.replace(/^\/+|\/+$/g,'')
    var queryStringObject=parseUrl.query
    var method=req.method;

    var decoder=new StringDecoder('utf8');
    var buffer=''
    req.on('data',(data)=>{
        buffer+=decoder.write(data)
    })
    req.on('end',()=>{
        buffer+=decoder.end()

        var data={
            'method':method,
            'trimPath':trimPath,
            'headers':headers,
            'queryStringObject':queryStringObject,
            'payload':helpers.JsonToObject(buffer)
        }
       
        var chooseHandler=typeof(routes[data.trimPath])!=='undefined'?routes[data.trimPath]:handler.notFound
        chooseHandler=trimPath.indexOf('public/')>-1?handler.public:chooseHandler;
        chooseHandler(data,(statusCode,payload,contentType)=>{
            statusCode=typeof(statusCode)=='number'?statusCode:200;
            contentType=typeof(contentType)=='string'?contentType:'json';

            var payloadString=''
            if(contentType=='json'){
                res.setHeader('Content-Type','application/json')
                payload=typeof(payload)=='object'?payload:{}
                payloadString=JSON.stringify(payload)
            }
            if(contentType=='html'){
                res.setHeader('Content-Type','text/html')
                payloadString=typeof(payload)=='string'?payload:'';
            }
            if(contentType=='css'){
                res.setHeader('Content-Type','text/css');
                payloadString=typeof(payload)!=='undefined'?payload:'';
            }
            if(contentType=='plain'){
                res.setHeader('Content-Type','text/plain')
                payloadString=typeof(payload)!=='undefined'?payload:''
                
            }
            res.writeHead(statusCode);
            res.end(payloadString)
        })

       
       
    })

}


module.exports=unifiedServer