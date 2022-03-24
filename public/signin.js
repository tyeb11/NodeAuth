

var app={}

app.config={
    'sessionToken':false
}

app.client={}

app.client.request=function(headers,path,method,queryStringObject,payload,callback){
    headers=typeof(headers)=='object'&&headers!==null?headers:{};
    path=typeof(path)=='string'?path:'/';
    method=typeof(method)=='string'&&['POST','PUT','GET','DELETE'].indexOf(method.toUpperCase())>-1?method.toUpperCase():'GET';
    queryStringObject=typeof(queryStringObject)=='object'&&queryStringObject!=null?queryStringObject:{};
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
    xhr.onreadystatechange=function(){
        if(xhr.readyState==XMLHttpRequest.DONE){
            var statusCode=xhr.status;
            var responseReturned=xhr.responseText
            try{
                var parsedResponse=JSON.parse(responseReturned);
                callback(statusCode,parsedResponse)
            }catch(e){
                callback(statusCode,false)
            }
        }
    }
    var payloadString=JSON.stringify(payload)
    xhr.send(payloadString)
}







app.bindForms=function(){
    if(document.querySelector('form')){
        var allForms=document.querySelectorAll('form')[0];
        var form={
            username:document.getElementById('username'),
            password:document.getElementById('password'),
            email:document.getElementById('email')
        }
        allForms.addEventListener('submit',(e)=>{
            e.preventDefault();
            var path=allForms.action;
            var method=allForms.method.toUpperCase();
            var payload={
                username:form.username.value,
                password:form.password.value,
                email:form.email.value
            }
            app.client.request(undefined,path,method,{},payload,function(statusCode,responsePayload){
                if(statusCode==200){
                    window.location='otp'
                }else{
                    console.log('Error')
                }
            })
        })
    }
}


app.init=function(){
    app.bindForms()
}
window.onload=function(){
    app.init()
}


