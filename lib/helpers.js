var path=require('path');
var fs=require('fs');
var crypto=require('crypto')
var nodemailer=require('nodemailer')




//console.log(path.join(__dirname,'../templates/'))

var helpers={}

helpers.hash=function(str){
    if(typeof(str)=='string'&&str.length>0){
        var hash=crypto.createHash('sha256','secretKey').update(str).digest('hex');
        return hash;
    }
}

helpers.sendOtp=function(otp,email,username){
    var transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'your email id',
            pass:'your password'
        }
    })
    var mailOptions={
        form:'your email id',
        to:email,
        subject:'Verification Code',
        text:'Hi! '+username+' your Verification Code is '+otp
    }
    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            console.log(err)
        }else{
            console.log('Email sent to '+email)
        }
    })

}

helpers.generateOtp=function(){
    var possibleChar='ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    var str=''
    for(var i=0;i<4;i++){
        var randomChar=possibleChar.charAt(Math.floor(Math.random()*possibleChar.length))
        str+=randomChar
    }
    return str;    
}


helpers.createRandomString=function(strLen){
    if(strLen){
        var possibleChar='abcdefghijklmnopqrstuvwxyz1234567890'
        var str=''
        for(var i=0;i<strLen;i++){
            var randomChar=possibleChar.charAt(Math.floor(Math.random()*possibleChar.length))
            str+=randomChar
        }
        return str;
    }else{
        return false
    }
}




helpers.JsonToObject=function(str){
    str=typeof(str)=='string'&&str.length>0?str:false;
    if(str){
        return JSON.parse(str)
    }else{
        return {}
    }
}


helpers.getTemplate=function(filename,callback){
   var templateDir=path.join(__dirname,'../templates/');
   if(filename){
       fs.readFile(templateDir+filename+'.html','utf8',function(err,data){
           if(!err){
               
               callback(false,data)
           }else{
               callback('can not find templae')
           }
       })
   }else{
       callback('not a valid name')
   } 
}

helpers.getStaticAsset=function(fileName,callback){
    var publicDir=path.join(__dirname,'../public/')
    if(fileName){
        fs.readFile(publicDir+fileName,function(err,data){
            if(!err&&data){
                callback(false,data)
            }else{
                callback('can not find file')
            }
        })
    }else{
        callback('not a valid file name')
    }
}




module.exports=helpers;
