const helpers = require("./helpers");
var _data=require('./data');



var handler={};





handler.signIn=function(data,callback){
    if(data.method=='GET'){
        helpers.getTemplate('SignIn',function(err,str){
            if(!err&&data){

                callback(200,str,'html')
            }else{
                callback(500,undefined,'html')
            }
        })
    }else{
        callback(405,'undefined','html')
    }
}

handler.otp=function(data,callback){
    if(data.method=='GET'){
        helpers.getTemplate('Otp',function(err,str){
            if(!err&&data){

                callback(200,str,'html')
            }else{
                callback(500,undefined,'html')
            }
        })
    }else{
        callback(405,'undefined','html')
    }
}




handler.public=function(data,callback){
    if(data.method=='GET'){
        var trimAssetName=data.trimPath.replace('public/','').trim();
        if(trimAssetName){
            helpers.getStaticAsset(trimAssetName,function(err,data){
                if(!err){
                    var contentType='plain'
                    if(trimAssetName.indexOf('.css')){
                        contentType='css'
                        
                    }
                    
                    callback(200,data,contentType)
                }else{
                    callback(404)
                }
            })
        }else{
            callback(404)
        }
    }else{
        callback(405)
    }
}



handler.logIn=function(data,callback){
    if(data.method=='GET'){
        helpers.getTemplate('LogIn',function(err,data){
            if(!err&&data){
                callback(200,data,'html')
            }else{
                callback(500,undefined,'html')
            }
        })
    }else{
        callback(405,undefined,'html')
    }
}



handler.welcome=function(data,callback){
    if(data.method=='GET'){
        helpers.getTemplate('Welcome',function(err,data){
            if(!err&&data){
                callback(200,data,'html')
            }else{
                callback(500,undefined,'html')
            }
        })
    }else{
        callback(405,undefined,'html')
    }
}

handler.notFound=function(data,callback){
    if(data.method=='GET'){
        callback(404,`<h1>Page Not Found</h1>`,'html')
    }
}



handler.users=function(data,callback){
    var acceptableMethods=['GET','POST','PUT','DELETE'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handler._users[data.method](data,callback)
    }else{
        callback(405,{'Error':'Not A Valid Request'})
    }
}
handler._users={}

handler._users.POST=function(data,callback){
    var email=typeof(data.payload.email)=='string'&&data.payload.email.trim().length>0?data.payload.email.trim():false;
    var password=typeof(data.payload.password)=='string'&&data.payload.password.trim().length>0?data.payload.password.trim():false;
    var username=typeof(data.payload.username)=='string'&&data.payload.username.trim().length>0?data.payload.username.trim():false;
    if(email&&password&&username){
        _data.read('users',username,function(err){
            if(err){
                var hashedPassword=helpers.hash(password);
                if(hashedPassword){
                    var obj={
                        'email':email,
                        'hashedPassword':hashedPassword,
                        'username':username
                    }
                    _data.create('users',username,obj,function(err){
                        if(!err){
                            var newObj={
                                'email':email,
                                'password':password,
                                'username':username
                            }
                            var otp=helpers.generateOtp()
                            _data.create('otps',otp,newObj,function(err){
                                if(!err){
                                   helpers.sendOtp(otp,email,username) 
                                    callback(200)
                                }else{
                                    callback(500,{'Error':'Can not create otp'})
                                }
                            })
                        }else{
                            callback(500,{'Error':'Can not Create user'})
                        }
                    })
                }else{
                    callback(400,{'Error':'Can not Hash Password'})
                }
            }else{
                callback(400,{'Error':'User Already Exists'})
            }
        })
    }else{
        callback(400,{'Error':'Missing Required Feilds'})
    }
}
handler._users.GET=function(data,callback){
    var username=typeof(data.queryStringObject.username)=='string'&&data.queryStringObject.username.trim().length>0?data.queryStringObject.username.trim():false;
    if(username){
        var token=typeof(token)=='string'?data.headers.token.trim():false;
        handler._tokens.verify(token,username,function(tokenVerified){
            if(tokenVerified){
                _data.read('users',username,function(err,data){
                    if(!err&data){
                        delete data.hashedPassword
                        callback(200,data)
                    }else{
                        callback(404,{'Error':'user does not exists'})
                    }
                })
            }else{
                callback(403,{'Error':'Missing token in header'})
            }
        })
    }else{
        callback(400,{'Error':'Missing required Feilds'})
    }
}
handler._users.PUT=function(data,callback){
    var username=typeof(data.payload.username)=='string'&&data.payload.username.trim().length>0?data.payload.username.trim():false;
    var password=typeof(data.payload.password)=='string'&&data.payload.password.trim().length>0?data.payload.password.trim():false; 
    var email=typeof(data.payload.email)=='string'&&data.payload.email.trim().length>0?data.payload.email.trim():false;
    if(username){
        if(password||email){
            var token=typeof(data.headers.token)=='string'?data.headers.token:false;
            handler._tokens.verify(token,username,function(err,userData){
                if(tokenVerified){
                    _data.read('users',username,function(err,userData){
                        if(!err&&userData){
                            if(email){
                                userData.email=email
                            }
                            if(password){
                                userData.hashedPassword=helpers.hash(password)
                            }
                            _data.update('users',username,userData,function(err){
                                if(!err){
                                    callback(200)
                                }else{
                                    callback(500,{'Error':'can not update'})
                                }
                            })
                        }else{
                            callback(400,{'Error':'user does not exists'})
                        }
                    })
                }else{
                    callback(403,{'Error':'missing required token'})
                }
            })
        }else{
            callback(400,{'Error':'Missing Feilds'})
        }
    }else{
        callback(400,{'Error':'Missing requiredFeilds'})
    }
}
handler._users.DELETE=function(data,callback){
    var username=typeof(data.queryStringObject.username)=='string'?data.queryStringObject.username.trim():false;
    if(username){
        var token=typeof(data.headers.token)=='string'?data.headers.token:false;
        handler._tokens.verify(token,username,function(tokenVerified){
            if(tokenVerified){
                _data.read('users',username,function(err,userData){
                    if(!err){
                        _data.delete('users',username,function(err){
                            if(!err){

                                callback(200)
                            }else{
                                callback(500,{'Error':'Can not delete user'})
                            }
                        })
                    }else{
                        callback(510,{'Error':'user does not exists'})
                    }
                })
            }else{
                callback(404,{'Error':'Missing token from headers'})
            }
        })
    }else{
        callback(400,{'Error':'Missing required Feilds'})
    }
}



handler.tokens=function(data,callback){
    var acceptableMethods=['POST','GET','PUT','DELETE'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handler._tokens[data.method](data,callback)
    }

}


handler._tokens={}

handler._tokens.POST=function(data,callback){
    var username=typeof(data.payload.username)=='string'&&data.payload.username.trim().length>0?data.payload.username.trim():false;
    var password=typeof(data.payload.password)=='string'&&data.payload.password.trim().length>0?data.payload.password.trim():false;
    if(username&&password){
        _data.read('users',username,function(err,userData){
            if(!err&&userData){
                var hashedPassword=helpers.hash(password);
                if(hashedPassword==userData.hashedPassword){
                    var tokenId=helpers.createRandomString(20);
                    var expires=Date.now()+5000*60*60;
                    var tokenObj={
                        'username':username,
                        'id':tokenId,
                        'expires':expires
                    }
                    _data.create('tokens',tokenId,tokenObj,function(err){
                        if(!err){
                            callback(200,tokenObj)
                        }else{
                            callback(500,{'Error':'Can not create token'})
                        }
                    })
                }else{
                    callback(400,{'Error':'can not find users'})
                }
            }else{
                callback(500,{'Error':'can not read file'})
            }
        })
    }else{
        callback(400,{'Error':'Missing required Feilds'})
    }
}
handler._tokens.GET=function(data,callback){
    var id=typeof(data.queryStringObject.id)=='string'?data.queryStringObject.id.trim():false;
    if(id){
        _data.read('tokens',id,function(err,tokenData){
            if(!err&&tokenData){
                callback(200,tokenData)
            }else{
                callback(404,{'Error':'token does not Exists'})
            }
        })
    }else{
        callback(400,{'Error':'Missing Required Feilds'})
    }
}
handler._tokens.PUT=function(data,callback){
    var id=typeof(data.payload.id)=='string'?data.payload.id.trim():false;
    var extend=typeof(data.payload.extend)=='boolean'&&data.payload.extend==true?true:false;
    if(id&&extend){
        _data.read('tokens',id,function(err,tokenData){
            if(!err&&tokenData){
                if(tokenData.expires>Date.now()){
                    tokenData.expires=Date.now()+5000*60*60;

                    _data.update('tokens',id,tokenData,function(err){
                        if(!err){
                            callback(200)
                        }else{
                            callback(500,{'Error':'Can not Update'})
                        }
                    })
                }else{
                    callback(400,{'Error':'Token Expired'})
                }
            }else{
                callback(400,{'Error':'token Expired'})
            }
        })
    }else{
        callback(400,{'Error':'Missing required Feilds'})
    }
}
handler._tokens.DELETE=function(data,callback){
    var id=typeof(data.queryStringObject.id)=='string'?data.queryStringObject.id.trim():false;
    if(id){
        _data.read('tokens',id,function(err,data){
            if(!err&&data){
                _data.delete('tokens',id,function(err){
                    if(!err){
                        callback(200)
                    }else{
                        callback(500,{'Error':'can not delete id'})
                    }
                })
            }else{
                callback(400,{'Error':'User does not exists'})
            }
        })
    }else{
        callback(400,{'Error':'Missing required Feilds'})
    }
}


handler._tokens.verify=function(id,username,callback){
    _data.read('tokens',id,function(err,tokenData){
        if(!err){
            if(tokenData.username==username&&tokenData.expires>Date.now()){
                callback(true)
            }else{
                callback(false)
            }
        }else{
            callback(false)
        }
    })
}

handler._otps={}

handler.otps=function(data,callback){
    var acceptableMethods=['GET','POST','PUT','DELETE']
    if(acceptableMethods.indexOf(data.method)>-1){
        handler._otps[data.method](data,callback)
    }
}


handler._otps.POST=function(data,callback){
    var otp=typeof(data.payload.otp)=='string'?data.payload.otp.trim():false;
    if(otp){

        _data.read('otps',otp,function(err,data){
            if(!err&&data){
                callback(200,data)
            }else{
                callback(404,{'Error':'otp not valid'})
            }
        })
    }else{
        callback(400,{'Error':'Missing required feilds'})
    }
}
handler._otps.DELETE=function(data,callback){
    var otp=typeof(data.payload.otp)=='string'?data.payload.otp.trim():false;
    if(otp){
        _data.read('otps',otp,function(err,data){
            if(!err&&data){
                _data.delete('otps',otp,function(err){
                    if(!err){
                        callback(200)
                    }else{
                        callback(500,{'Error':'can not delete id'})
                    }
                })
            }else{
                callback(400,{'Error':'User does not exists'})
            }
        })
    }else{
        callback(400,{'Error':'Missing required Feilds'})
    
    }
}













module.exports=handler