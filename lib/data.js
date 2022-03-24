var path=require('path');
var fs=require('fs');
const helpers = require('./helpers');


var lib={}

lib.baseDir=path.join(__dirname,'../.data/')

lib.create=function(dir,file,data,callback){
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx+',function(err,fileDescription){
        if(!err&&fileDescription){
            var stringData=JSON.stringify(data)
            fs.writeFile(fileDescription,stringData,function(err){
                if(!err){
                    fs.close(fileDescription,function(err){
                        if(!err){
                            callback(false)
                        }else{
                            callback('can not close file')
                        }
                    })
                }else{
                    callback('can not write file')
                }
            })
        }else{
            callback('user already exists')
        }
    })
}
lib.read=function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        if(!err&&data){
            var parseData=helpers.JsonToObject(data)
            console.log('Sucss')
            callback(false,parseData)
        }else{
            callback(err,data)
        }
    })
}
lib.update=function(dir,file,data,callback){
    var stringData=JSON.stringify(data);
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescription){
        if(!err&&fileDescription){
            fs.ftruncate(fileDescription,function(err){
                if(!err){
                    fs.writeFile(fileDescription,stringData,function(err){
                        if(!err){
                            fs.close(fileDescription,function(err){
                                if(!err){
                                    callback(false)
                                }else{
                                    callback('Error closing File')
                                }
                            })
                        }else{
                            callback('Error writing file')
                        }
                    })
                }else{
                    callback('Error updating file')
                }
            })
        }else{
            callback('file does not exists')
        }
    })
}
lib.delete=function(dir,file,callback){
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false)
        }else{
            callback('can not delete')
        }
    })
}
lib.list=function(dir,callback){
    fs.readdir(lib.baseDir+dir+'/',function(err,data){
        if(!err&&data){
            var trimFileName=[]
            data.forEach(function(name){
                trimFileName.push(name.replace('.json',''))
            })
            callback(false,trimFileName)
        }else{
            callback(err,data)
        }
    })
}


module.exports=lib;