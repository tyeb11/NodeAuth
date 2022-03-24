var handler=require('./handler')


var routes={
    '':handler.signIn,
    'welcome':handler.welcome,
    'login':handler.logIn,
    'otp':handler.otp,
    'api/users':handler.users,
    'api/tokens':handler.tokens,
    'api/otps':handler.otps,
    'notFound':handler.notFound
}



module.exports=routes
