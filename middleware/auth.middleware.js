
const { sign, verify } = require('jsonwebtoken');
const { compare } = require('bcrypt');
const userDao = require("../dao/user.dao");

const signOps = {
    algorithm:'HS512',
    subject:'auth',
    audience:'client',
    issuer:'video-stream'
}

const cookieOptions = { 
    httpOnly: true, 
    signed: true, 
    path:'/',
    sameSite:'strict'  
}

const jwtSecret = 'aXRzYXNlY3JldA=='

module.exports = {
    authenticate : async (request, response, next) => {
        let status = 'error', message = 'User authentication failed', data = {}, validation = [];
        try {
            let {email, password} = request.body;
            let user = await userDao.authenticateUserByEmail(email);
            console.log(user)
            if(user && user.status == 'ACTIVE'){
                let isPasswordValid = await compare(password, user.password)
                if(isPasswordValid){
                    data['firstName'] = user.firstName;
                    data['lastName'] = user.lastName;
                    data['email'] = user.email;
                    data['roles'] = user.UserRoleMappings.map(r => r.Role.name);
                    data['isLoggedIn'] = true;

                    let token = await sign(data, jwtSecret, signOps)
                    // data['token']=token;
                    response.cookie('authorization',('Bearer ').concat(token), cookieOptions);
                    response.cookie('username',email, cookieOptions);
                    response.cookie('isLoggedIn', true, { path: '/', sameSite: 'strict'});
                    response.cookie('fullName', data['firstName'] + ' ' + data['lastName'], { path: '/', sameSite: 'strict'});
                    response.cookie('email', data['email'], { path: '/', sameSite: 'strict'});
                    response.cookie('roles', data['roles'].join('-'), { path: '/', sameSite: 'strict'});

                    status = 'success';
                    message = 'User authenticated successfully.'
                    response.locals.isLoggedIn = true;
                }else
                    validation.push('Email/Password is invalid.')
            } else if(user && user.status == 'PENDING')
                validation.push('User email verification is pending!');
              else if(user && user.status == 'INACTIVE')
                validation.push('User account is INACTIVE');
              else if(user && user.status == 'BLOCKED')
                validation.push('User account is BLOCKED.');
              else
                validation.push('User not found.');
        }catch(error){
            console.log(error);
            validation.push('Something went wrong');
        }finally{
            return response.jsonp({ status, message, validation, data })
        }
    },
    authorize : async (request, response, next) => {
        let validation = [], status = 'error', message = 'Unauthorized access', data = {};
        try {
            
            let tokens = undefined;
            if(request.headers['authorization'])
                tokens = request.headers['authorization'].split(' ');
            else if(request.signedCookies['authorization'])
                tokens = request.signedCookies['authorization'].split(' ');

            let result = undefined;
            if(tokens){
                if(tokens.length > 1 && 'Bearer' == tokens[0]){
                    result = verify(tokens[1], jwtSecret, signOps);
                } else 
                    validation.push('Invalid bearer token')
            }

            if(result){
                response.locals.isLoggedIn = true;
                response.locals.auth = result;
            } else
                response.locals.isLoggedIn = false;

            response.cookie('isLoggedIn', response.locals.isLoggedIn, { path: '/', sameSite: 'strict'});

            if((request.url).startsWith('/api/auth')){
                if(result)
                    return response.redirect('/ui/');
                else 
                    return next();
            } else if((request.url).startsWith('/api/user')){
                if(result && result.roles.includes('USER'))
                    return next();
                else 
                    return response.redirect('/ui/');
            } else if((request.url).startsWith('/api/admin')){
                if(result && result.roles.includes('ADMIN'))
                    return next();
                else 
                    return response.redirect('/ui/');
            } else if((request.url).startsWith('/api/account')){
                if(result && (result.roles.includes('ADMIN') || result.roles.includes('USER')))
                    return next();
                else 
                    return response.redirect('/ui/');
            } else 
                return next()
            
        }catch(error){
            console.log(error);
            validation.push('Invalid bearer token')
        }
            return response.render('pages/unauthorized-access',{status, message, validation, data})
        }
}