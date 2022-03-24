

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



app.bindForms=function(){
    if(document.querySelector('form')){
        var allForms=document.querySelectorAll('form')[0];
        var form={
            otp:document.getElementById('otp')
        }
        allForms.addEventListener('submit',(e)=>{
            e.preventDefault();
            var formId=allForms.id;
            var path=allForms.action;
            var method=allForms.method.toUpperCase();
            var payload={
                otp:form.otp.value
            }
            var queryStringObject=method=='DELETE'?payload:{};
            app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
                if(statusCode==200){
                    app.formResponseProcessor(formId,payload,responsePayload)
                }else{
                    console.log('Error')
                }
            })
        })
    }
}

app.formResponseProcessor=function(formId,requestPayload,responsePayload){
    app.client.request(undefined,'api/tokens','POST',undefined,responsePayload,function(newStatusCode,newResponsePayload){
        if(newStatusCode==200){
            app.setSessionToken(newResponsePayload);
            window.location='welcome'
            app.client.request(undefined,'api/otps','DELETE',undefined,requestPayload,function(statusCode,res){
                if(statusCode==200){

                }else{
                    console.log('err')
                }
            })
        }
    })
}

app.setSessionToken=function(token){
    app.config.sessionToken=token;
    var tokenString=JSON.stringify(token)
    localStorage.setItem('token',tokenString);
    
}


app.init=function(){
    app.bindForms()

}


window.onload=function(){
    app.init()
}