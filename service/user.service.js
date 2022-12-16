require('dotenv').config()
let {User, UserRoleMapping, ResetPassword, sequelize, QueryTypes, UserOtp, Role } = require('../database/model');
let { hash, genSalt, compare} = require('bcrypt');
const userDao = require('../dao/user.dao');
const mailService = require('./mail.service');
const randomHelper = require('../helper/random.helper');
const otpDao = require('../dao/user-otp.dao');
const jwtHelper = require('../helper/jwt.helper');
const uploadService = require('./upload.service');
const md5 = require('md5');
const path = require('path');
const logger = require('../config/logger').getLogger('UserService');

const { OtpTypeEnum, UserStatusEnum, UploadEnum, UserRoleEnum } = require('../enum');



let service = {
    register : async (req, res) => {
        let validation = [], status = 'error', message = 'Registration process failed';

        try {
            let {fname,lname,dob,gender,email,password,std,mobile} = req.body;

            let isUserExist = await User.findOne({where:{email},attributes:['id']});
            console.log('->>>>>');
            console.log(isUserExist);
            console.log('<<<<<-');
            if(!isUserExist){
                let salt = await genSalt(10);
                let _password = await hash(password, salt);
                let mobileWithStd = std + '-'+ mobile;

                console.log('line 33');

                let user = await User.create({firstName:fname,lastName:lname,dob,gender,email,password:_password, mobile: mobile, std: std});

                console.log('line 38');

                if(user){
                    console.log('line 35');

                    let role = await Role.findOne({where:{name:UserRoleEnum.USER}});
                    console.log('line 38', role);

                    await UserRoleMapping.create({userId:user.id,roleId:role.id})

                    console.log('line 42');

                    service.resendSignUpOtp({email});
                    status = 'success';
                    message = `Email verification otp sent to your email '${email}'`;
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!');
                }
            } else {
                validation.push('Email is already exist.')
            }
        } catch(error){
            console.log('mmmmmmmmmmmmmm', error);
            logger.error(error)
        }
        res.jsonp({
            status,
            message,
            validation
        })
    },
    isEmailExist : async (email) => {
        let result = false;
        try {
            let user = await User.findOne({where:{email}})
            if(user)
                result= true;
        }catch(error){
            logger.error(error)
        }finally{
            return result;
        }
    },
    resetPassword : async (req, res) => {
        let status = 'error', validation=[], message=undefined;
        try {
            let {email} = req.body;
            let user = await userDao.getUserByEmail(email);
            if(user){
                let token = await jwtHelper.generateTokenWithExpiry(user);
                let rp = await ResetPassword.create({userId: user.id, token : token});
                if(rp){
                    await mailService.sendResetPasswordLinkMail({
                        email: email,
                        username: user.firstName + ' ' + user.lastName,
                        resetLink: process.env.CLIENT_URL + `/api/auth/view/reset/password?serial=${rp.id}&token=${token}`
                    });

                    status='success';
                    message='Reset password mail has been sent successfully to your registered email.'
                } else {
                    validation.push("Reset password link generation failed")
                }
            }else 
            validation.push("Email id is not registered with us.")
       }catch(error){
           logger.error(error)
            validation.push("Reset password mail failed.")
        }
        return res.jsonp({status,message,validation});
    },
    logout : (req, res) => {
        let option = {
            httpOnly: true, 
            signed: true, 
            path:'/',
            sameSite:'strict',
            expires: new Date(0) 
              
        }
        res.clearCookie("authorization", option);
        res.clearCookie("username", option);
        res.clearCookie('isLoggedIn', false, { path: '/', sameSite: 'strict', expires: new Date(0) });
        res.clearCookie('fullName', { path: '/', sameSite: 'strict', expires: new Date(0) });
        res.clearCookie('email', { path: '/', sameSite: 'strict', expires: new Date(0) });
        res.clearCookie('roles', { path: '/', sameSite: 'strict', expires: new Date(0) });

        return res.jsonp({status:'success', data:{ isLoggedIn : false}, message:'User logout successfully'})
    },
    getUserByIdOrEmail : async ({email, userId}) => {
        logger.info('fetching user profile ')
        let validation = [], status = 'error', message = undefined, data = {}, user = undefined;
        try {
            if(email)
                user = await userDao.getUserByEmail(email);
            else 
                user = await userDao.getUserById(userId);
            if(user){
                if(!user['avatar']){
                    if(user.gender == 'M') 
                    user['avatar']=  '/static/img/male.png';
                    else if(user.gender == 'F') 
                    user['avatar'] =  '/static/img/female.png';
                }
                data['user'] = user;
                status='success';
            } else 
                validation.push('User not found');
            return {status, message, validation, data};
        } catch(error){
            logger.error(error);
            validation.push("something went wrong");
            return {status, message, validation, data}
        }
    },
    getProfileEdit : async (req, res) => {
        let validation = [], status = 'error', message = 'Request processed successfully', user = {};
        try {
            if(res.locals.auth){
                let {email} = res.locals.auth;
                user = await userDao.getUserByEmail(email);
                status='success';
            }
        } catch(error) {
            logger.error(error);
            message = 'Something went wrong';
        }
        res.render('pages/user/profile-edit', {name:'Profile Edit', status, message, validation, data: user})
    },
    getPasswordUpdate : (req, res) => {
        res.render('pages/user/profile-password-update', {name:'Update Profile Password'});
    },
    updateProfile :(req, res) =>{
        let validation = [], status = 'error', message = 'Request processed successfully', data = {};
        return res.jsonp(status, validation, message, data)
    },
    updateProfilePassword : async (request, response) => {
        let status = 'error', data={}, validation=[], message = 'Profile password updated successfully.'
        let {opassword, npassword, cpassword, otp} = request.body;
        let {email, firstName, lastName} = response.locals.auth;
        logger.info(`POST : Updating password request for ${email}`)
        try{
            let _otp = await UserOtp.findOne({where:{email: email, type: OtpTypeEnum.UPDATE_PASSWORD}, order:[['id','DESC']], limit:1});
            if(_otp){
                logger.info(`OTP exist for ${email}`)
                if(_otp.otp == otp){
                    logger.info(`OTP is valid for ${email}`)
                    await otpDao.inactiveOTP(_otp.id);
                    let user = await userDao.getUserPasswordByEmail(email);
                    let isValid = await compare(opassword, user.password);
                    if(isValid){
                        logger.info(`old password is correct`)
                        let salt = await genSalt(10);
                        let _password = await hash(npassword, salt);
                        logger.error(_password);
                        await userDao.updatePasswordByEmail(_password, email);
                        logger.info(`New password updated`);
                        mailService.sendUpdatePasswordSuccessMail({
                            email: email,
                            username: [firstName, lastName].join(' ')
                        })
                        status = 'success';
                    } else {
                        validation.push('Your current password is invalid.')
                    }
                } else {
                    validation.push('OTP is invalid.');
                }
            } else
                validation.push('OTP not found');
        } catch(error){
            logger.error(error);
            validation.push('Password update process failed.')
        }
        return response.jsonp({status,data,validation,message})
    },
    updateProfilePasswordOtp : async (request, response) => {
        let status = 'error', data={}, validation=[], message = 'Otp has been sent to your email';
        try {
            let { email, firstName, lastName } = response.locals.auth;
            let otp = randomHelper.rand6Num();
            logger.info("Your update password otp : " + otp)
    
            await UserOtp.create({email:email, otp: otp, type: OtpTypeEnum.UPDATE_PASSWORD});
            mailService.sendUpdatePasswordOtpMail({email, username: [firstName, lastName].join(' '), otp});
            status = 'success';
        } catch(error){
            logger.error(error)
            message = 'Sending OTP has failed!'
        }
        response.jsonp({status,message,data,validation})
    },
    setNewPasswordView : async(req, res) => {
        let status = "error", validation = [], message = undefined, data = {}, isValid = false;
        try {
            let {token, serial } = req.query;
            if (token && serial) {
                let details = await jwtHelper.validateToken(token);
                if (details.isValid) {
                    isValid = details.isValid;
                    let user = await User.findOne({ where: { email: details.data.email, active: 1 }, attributes: ['id', 'email', 'firstName', 'lastName'] });
                    if (user) {
                        let rp = await ResetPassword.findOne({ where: { id: serial, active: 1, userId: user.id } })
                        if (rp) {
                            data = { ...user.toJSON(), _csrf: req.csrfToken(),token,serial };
                        
                            status = 'success';
                            message = "Account password updated successfully";
                        } else{
                            isValid = false;
                            validation.push("Password reset link has been consumed already")
                        }
                    } else{
                        isValid = false;
                        validation.push('Invalid token for the user');
                    }
                } else
                    validation.push("Invalid Token")
            } else
                validation.push('Access token is required');
            return res.render('pages/auth/set-new-password', { isValid, status, validation, data, message , nav : 'hide'});
        } catch (error) {
            validation.push('Your reset password token has expired/malformed.');
            return res.render('pages/auth/set-new-password', { isValid: false, status, validation, data: { _csrf: req.csrfToken() } , nav : 'hide'})
        }
    },
    setNewPassword : async (req,res) => {
        let status = 'error', validation = [], data = {}, message = undefined;
        try {
            let { npassword, token, serial } = req.body;
            logger.info(req.body)

            if(token && serial ){
                let details = await jwtHelper.validateToken(token)
                if(details.isValid){
                    logger.info(`token is valid : ${details}`)
                    let { email, id, firstName, lastName } = details.data;
                    let rp = await ResetPassword.findOne({where:{id:serial, active:1, userId : id}})
                    logger.info(`Reset password row : ${rp}`)
                    if(rp){
                        let salt = await genSalt(10);
                        let _password = await hash(npassword, salt);
                        await User.update({password: _password},{where : {email : email}});
                        await rp.update({active:0});

                        mailService.sendUpdatePasswordSuccessMail({
                            email: email,
                            username: [firstName, lastName].join(' ')
                        });

                        status = 'success';
                        message = 'Account password updated successfully';
                    }else 
                        validation.push("Invalid token");
                }
            } else 
                validation.push('Invalid access token');
                return res.jsonp({status, validation, message});
        } catch(error) {
            validation.push('Your reset password token has expired/malformed.');
            return res.jsonp({status, validation, message})
        }
    },
    getUsers : async (req, res) => {
        let validation = [], status='error',message=undefined, data = [];
        let { page, size, userEmail } = req.query;
        try{
            let limit = size || 5;
            let offset = (page >= 1) ? (page-1) * size : 0;

            let filter = {};
            if(userEmail){
                filter.email = userEmail;
            }
            let count = await User.count({where: filter });
            let users = await User.findAll({
                where: filter,
                limit:parseInt(limit),
                offset:parseInt(offset),
                attributes:['firstName','lastName','email','active','id', 'status','createdAt','avatar'],
                include:{
                    model: UserRoleMapping,
                    attributes:['roleId'],
                    include:{
                        model: Role,
                        attributes: ['name']
                    }
                },
                order:[['createdAt','DESC']]
            });
            if(!users || users.length <= 0 ) {message = 'No data found'} else {message = 'Users data loaded.'};
            return res.jsonp({status:'success',data:{count,users}, validation, message});
        }catch(err){
            console.log(err)
            validation.push('Something went wrong');
            return res.jsonp({status:'success',data, validation, message});
        }
    },
    getProfileImage : async (req, res) => {
        let validation = [], status='error',image=undefined, data = [];
        try{
                let { auth } = res.locals;
                if(auth && auth.email){
                    let email = auth.email;
                    let user = await User.findOne({where:{email}, attributes: ['avatar','gender']});
                    if(user){
                        if(user['avatar']){
                            image = user.avatar;
                            status='success';
                        }else{
                            if(user.gender == 'M') 
                                image =  '/static/img/male.png';
                            else if(user.gender == 'F') 
                                image =  '/static/img/female.png';
                            status='success';
                        }
                    } else 
                        validation.push('Profile image not found');
                } else {
                    status='success'
                    image =  '/static/img/male.png';
                }
            return res.jsonp({status, data:{image}, validation});
        }catch(err){
            logger.error(err);
            validation.push('Profile image not loaded!')
            return res.jsonp({status, data, validation});
        }
    },
    updateBioAvatar : async({body, email}) => {
        let validation = [], status='error',message=undefined, data = {};
        try {
            if(email){
                let user = await User.findOne({where:{email}, attributes:['id', 'bio', 'avatar']});
                if(user){
                    let { img, bio, mime, size } = body;

                    let updateBioForm = {};
                    if(img && img.trim() != ''){
                        let result = await uploadService.uploadBase64Img({chunk: img, email, mime, uploadType : UploadEnum.PROFILE_IMAGE});
                        if(result.status == 'success')
                            updateBioForm.avatar = result.file;
                    }

                    if(bio && bio.trim() != '')
                        updateBioForm.bio = bio;
                    
                    if(Object.keys(updateBioForm).length > 0){
                        await user.update(updateBioForm);
                        status = "success";
                        data.user = user;
                        message = "Public profile info updated successfully";
                    }
                } else 
                 validation('User not found');
            }else 
                validation('User not found');
            return { status, data, validation, message };
        }catch(err){
            validation.push('Something went wrong');
            return { status, data, validation, message };
        }
    },
    updatePrivateProfile : async({body, email}) => {
        let validation = [], status='error',message=undefined, data = {};
        try {
            if(email){
                let user = await User.findOne({where:{email}, attributes:['id','firstName', 'lastName', 'gender', 'mobile', 'address','dob']});
                if(user){
                    let updateQuery = {};
                    let { firstName, lastName, dob, gender, address, mobile } = body;

                    if(firstName != undefined && firstName != null && firstName.trim() != '')
                        updateQuery.firstName = firstName;
                    if(lastName != undefined && lastName != null && lastName.trim() != '')
                        updateQuery.lastName = lastName;
                    if(gender != undefined && gender != null && gender.trim() != '')
                        updateQuery.gender = gender;
                    if(dob != undefined && dob != null && dob.trim() != '')
                        updateQuery.dob = dob;
                    if(mobile != undefined && mobile != null && mobile.trim() != '')
                        updateQuery.mobile = mobile;
                    if(address != undefined && address != null && address.trim() != '')
                        updateQuery.address = address;

                    await user.update(updateQuery);
                    status = "success";
                    data.user = user;
                    message = "Private profile info updated successfully";
                } else 
                    validation('User not found');
            }else 
                validation('User not found');
            return { status, data, validation, message };
        }catch(err){
            validation.push('Something went wrong');
            return { status, data, validation, message };
        }
    },
    actionOnUserByAdmin : async ({ userId, block }) => {
        let status = 'error', validation = [], message = undefined, data = {};
        try {
            let user = await User.findOne({where : {id: userId, active: 1 }, attributes: ['email','id','firstName','lastName']});
            if(user){
                if(block){
                    await user.update({status: UserStatusEnum.BLOCKED});
                    mailService.sendUserBlockedMail({
                        email: user.email,
                        username: user.firstName + ' ' + user.lastName
                    })
                    message="User blocked successfully";
                    status = 'success'
                }else{ 
                    await user.update({status: UserStatusEnum.ACTIVE});
                    mailService.sendUserActivatedMail({
                        email: user.email,
                        username: user.firstName + ' ' + user.lastName
                    })
                    message="User activated successfully";
                    status='success'
                }
            } else {
                validation.push('User not found');
            }
            return {status, data, message, validation}
        } catch(err){
            validation.push('Something went wrong')
            return {status, validation}
        }
    },
    getStatistic : async () => {
        let status = 'error', validation = [], message = undefined, data = {};
        try {

            data.user = await sequelize.query(
                `select count(id) as count, status from user group by status `,
                { type: QueryTypes.SELECT });

            data.video = await sequelize.query(
                `select count(v.id) as count , v.status, v.visibility from video v left join channel c on c.id = v.channelId where v.active=1 and c.active=1 group by v.status, v.visibility `,
                { type: QueryTypes.SELECT });

            data.channel = await sequelize.query(
                    `select count(id) as count , status, visibility from channel where active=1 group by status, visibility `,
                    { type: QueryTypes.SELECT });
            
            status='success';

            return {status, data, message, validation}
        } catch(err){
            logger.error(err)
            validation.push('Something went wrong')
            return {status, validation}
        }
    },
    verifySignUpOtp : async({email, otp}) => {
        let status = 'error', validation = [], message = 'Sign up Otp not matched', data = {};
        try {
            let userOtp = await UserOtp.findOne({
                where: {email, type: OtpTypeEnum.SIGNUP}, 
                order: [
                    ['id', 'DESC']
                ],
                limit: 1
            });

            if(userOtp.otp == otp){
                let user = await User.findOne({where: {email, active: 0, status: UserStatusEnum.PENDING}, attributes:['email','id','firstName','lastName']});
                if(user){
                    await user.update({active: 1, status: UserStatusEnum.ACTIVE});   
                    mailService.sendSignUpSuccessMail({email: user.email, username: user.firstName + ' ' + user.lastName})
                    status = 'success'; 
                    message = 'User activated successfully.' 
                }
            } else {
                validation.push('SignUp Otp is not valid.')
            }
            return {status, data, message, validation}
        } catch(err){
            logger.error(err)
            validation.push('Something went wrong')
            return {status, validation}
        }
    },
    resendSignUpOtp : async({email}) => {
        console.log('resendSignOTP');

        let status = 'error', validation = [], message = undefined, data = {};
        try {
            console.log('email>>>>', email);

            let user = await User.findOne({
                where: {email, active: 0, status: UserStatusEnum.PENDING}, 
                attributes:['email','firstName','lastName']
            });

            console.log('User>>>>', user);

            if(user){
                let otp = randomHelper.rand6Num();
                console.log('OTP>>>>', otp);

                await UserOtp.create({email, otp, type: OtpTypeEnum.SIGNUP});

                console.log('user OTP created');

                mailService.sendSignUpOtpMail({
                    email: user.email,
                    username: user.firstName + ' ' + user.lastName,
                    otp: otp
                });
                message = 'OTP sent to your registered email.';
                status='success';
            } else
                validation.push('User not found');
                return {status, data, message, validation}
        } catch(err){
            console.log('abcd', err);
            logger.error(err)
            validation.push('Something went wrong')
            return {status, validation}
        }
    }
}

module.exports = service;