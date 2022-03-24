


var config={};

config.staging={
    'http':3000,
    'envName':'staging'
}
config.production={
    'http':5000,
    'envName':'production'
}

var chooseEnv=typeof(process.env.NODE_ENV)=='string'?process.env.NODE_ENV.toLowerCase():'';
var exportEnv=typeof(config[chooseEnv])=='object'?config[chooseEnv]:config.staging;


module.exports=exportEnv