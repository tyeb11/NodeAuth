console.log(localStorage.getItem('token'))


var app={}
app.config={
    'sessionToken':false
}

app.client={}

app.client.request=function(headers,path,method,queryStringObject,payload,callback){
    headers=typeof(headers)=='object'?headers:{};
    path=typeof(path)=='string'?path:'/';
    method=typeof(method)=='string'&&['POST','PUT','GET','DELETE'].indexOf(method.toUpperCase())>-1?method.toUpperCase():'GET';
    queryStringObject=typeof(queryStringObject)=='object'?queryStringObject:{};
    payload=typeof(payload)=='object'&&payload!==null?payload:{};
    var requestUrl=path+'?'
    var counter=0;
    for(var queryKey in queryStringObject){
        if(queryStringObject.hasOwnProperty(queryKey)){
        
            counter++;
            if(counter>1){
                requestUrl+='&'
            }
            requestUrl+=queryKey+'='+queryStringObject[queryKey]
            console.log('querkey:-',queryKey)
        }
        
    }
    var xhr=new XMLHttpRequest();
    xhr.open(method,requestUrl,true);
    xhr.setRequestHeader('Content-Type','application/json');
    for(var headerKey in headers){
        if(headers.hasOwnProperty(headerKey)){
        
            xhr.setRequestHeader(headerKey,headers[headerKey])
        }
        
    }
      if(app.config.sessionToken){
          xhr.setRequestHeader('token',app.config.sessionToken.id)
         }
    console.log('headers:-',headers)
    console.log('query:-',queryStringObject)
    xhr.onreadystatechange=function(){
        if(xhr.readyState==XMLHttpRequest.DONE){
            var statusCode=xhr.status;
            var responseReturned=xhr.responseText
            if(callback){
            try{
                var parsedResponse=JSON.parse(responseReturned);
                callback(statusCode,parsedResponse)
            }catch(e){
                callback(statusCode,false)
            }
        }
        }
    }
    var payloadString=JSON.stringify(payload)
    xhr.send(payloadString)
}


app.bindAccountDelete=function(){
    document.getElementById('deleteAccout').addEventListener('click',(e)=>{
        var ktoken=localStorage.getItem('token')
        var currentToken=JSON.parse(ktoken)
        app.config.sessionToken=currentToken
        var header=app.config.sessionToken
        var payload={
            'username':currentToken.username
        }
        app.client.request(header,'api/users','DELETE',payload,undefined,function(statusCode,responsePayload){
            if(statusCode==200){
                app.logUserOut()
                window.location='/'
            }
        })
    })
}





app.setSessionToken=function(token){
    app.config.sessionToken=token;
    var tokenString=JSON.stringify(token)
    localStorage.setItem('token',tokenString);
    if(typeof(token)=='object'){

    }else{
        window.location='/'
       console.log('sesion token not obj')
    }
    
}

app.getSessionToken=function(){
    var tokenString=localStorage.getItem('token')
    if(tokenString){
    var token=JSON.parse(tokenString)
    console.log(token)
    if(typeof(token)=='object'){
        //console.log(token.id)
        var queryStringObject={'id':token.id}
        app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
            if(statusCode==200){

            }else{
                window.location='/'
                console.log('statuscode err')
            }
        })
    }else{
        window.location='/'
        console.log('tokennotobj')
    }
}
else{
    window.location='/'
}
}

app.renewToken=function(){
    var ctoken=localStorage.getItem('token')
    var currentToken=JSON.parse(ctoken);
    if(currentToken){
        var payload={
            'id':currentToken.id,
            'extend':true
        }
        app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
            if(statusCode==200){
                var queryStringObject={'id':currentToken.id}
                app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
                    if(statusCode==200){
                        app.setSessionToken(responsePayload)
                        callback(false)
                    }else{
                        app.setSessionToken(false)
                        callback(true)
                    }
                })
            }
        })
    }
}


app.tokenRenewalLoop=function(){
    setInterval(function(){
        app.renewToken=function(callback){
            if(!err){
                console.log("token Renewed @"+Date.now())
            }
        }
    },5000*60)
}


app.bindLogOutButton=function(){
    document.getElementById('logoutButton').addEventListener('click',(e)=>{
        e.preventDefault()
        app.logUserOut()
    })
}

app.logUserOut=function(redirect){
    redirect=typeof(redirect)=='boolean'?redirect:true;
    var ctoken=localStorage.getItem('token')
    if(ctoken){

    
    var currentToken=JSON.parse(ctoken)
    var tokenId=currentToken.id;
    if(tokenId){
        var queryStringObject={
            'id':tokenId
        }
        app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,function(statusCode,responsePayload){
            app.setSessionToken(false);
            if(statusCode==200){
                localStorage.removeItem('token')
                window.location='/'
            }
        })
    }
}else{
    window.location='/'
}
}


app.init=function(){
    app.bindAccountDelete();
    app.bindLogOutButton();
    app.getSessionToken();
    app.tokenRenewalLoop();
    
}

window.onload=function(){
    app.init()
}