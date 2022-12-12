let { body, oneOf } = require('express-validator');
const userService = require('../service/user.service');

module.exports = {
    register : oneOf([
        body('email')
            .exists().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
            .custom(async (value) => {
                let isExist = await userService.isEmailExist(value);
                return isExist ? Promise.reject():Promise.resolve();
            }).withMessage('Email is already occupied.')
            .trim().toLowerCase(),
        body('fname')
            .exists().withMessage('First name is required')
            .isAlpha().withMessage()
            .isLength({min:3}).withMessage('First name length should be greater than 3')
            .isLength({max:45}).withMessage('First name length should be less than 48')
            .trim().toLowerCase(),
        body('lname')
            .optional()
            .isAlpha()
            .isLength({min:3}).withMessage('Last name length should be greater than 3')
            .isLength({max:45}).withMessage('Last name length should be less than 48')
            .trim().toLowerCase(),
        body('gender')
            .exists().withMessage('Gender is required')
            .isIn(['M','F','O']).withMessage('Gender is invalid'),
        body('dob')
            .exists().withMessage("Date of birth is required")
            .isDate({delimiters:['-'],format:'DD-MM-YYYY'}).withMessage("Date of birth format is invalid(DD-MM-YYYY)"),
        body('password')
            .exists().withMessage('Password is required')
            .isLength({min:8}).withMessage('Password length should be greater than 8')
            .isLength({max:12}).withMessage('Password length should be less than 12'),
        body('cpassword')
            .exists().withMessage('Confirm password is required')
            .custom((cpassword,{req}) => req.body.password == req.body.cpassword).withMessage("Confirm password didn't match with Password.")    
    ]),
    login : oneOf([
        body('email')
            .exists().withMessage('Email is required.')
            .isEmail().withMessage('Email is invalid.')
            .trim().toLowerCase(),
        body('password')
            .exists().withMessage('Password is required')
    ]),
    updateProfilePasswordOtp : oneOf([
        body('email')
            .exists().withMessage('Email is required.')
            .isEmail().withMessage('Email is invalid.')
            .trim().toLowerCase()
    ]),
    updateProfilePassword : oneOf([
        body('opassword')
            .exists().withMessage('Password is required'),
        body('npassword')
            .exists().withMessage('Password is required')
            .isLength({min:8}).withMessage('Password length should be greater than 8')
            .isLength({max:12}).withMessage('Password length should be less than 12'),
        body('cpassword')
            .exists().withMessage('Confirm password is required')
            .custom((cpassword,{req}) => req.body.npassword == req.body.cpassword).withMessage("Confirm password didn't match with new Password."),    
        body('otp')
            .exists().withMessage('Confirm password is required')
            .isLength({min:6}).withMessage('Password length should be greater than 6')
    ]),
    resetPassword : oneOf([
        body('npassword')
            .exists().withMessage('Password is required')
            .isLength({min:8}).withMessage('Password length should be greater than 8')
            .isLength({max:12}).withMessage('Password length should be less than 12'),
        body('cpassword')
            .exists().withMessage('Confirm password is required')
            .custom((cpassword,{req}) => req.body.npassword == req.body.cpassword).withMessage("Confirm password didn't match with new Password."),
        body('_csrf')
            .exists().withMessage('CSRF token is required')  
    ]),
    updateProfile : oneOf([
        body('fname')
            .exists().withMessage('First name is required')
            .isAlpha().withMessage()
            .isLength({min:3}).withMessage('First name length should be greater than 3')
            .isLength({max:45}).withMessage('First name length should be less than 48')
            .trim().toLowerCase(),
        body('lname')
            .optional()
            .isAlpha()
            .isLength({min:3}).withMessage('Last name length should be greater than 3')
            .isLength({max:45}).withMessage('Last name length should be less than 48')
            .trim().toLowerCase(),
        body('mobile')
            .optional()
            .isInt()
            .isLength({min:10}).withMessage('Mobile no length should be greater than 3')
            .isLength({max:10}).withMessage('Last name length should be less than 48')
            .trim().toString(),
        body('gender')
            .exists().withMessage('Gender is required')
            .isIn(['M','F','O']).withMessage('Gender is invalid'),
        body('dob')
            .exists().withMessage("Date of birth is required")
            .isDate({delimiters:['-'],format:'DD-MM-YYYY'}).withMessage("Date of birth format is invalid(DD-MM-YYYY)"),
    ]),
    createChannel : oneOf([
        body('name')
            .exists().withMessage('Channel Name is required')
            .isAlphanumeric().withMessage('Channel name should be alpha numeric')
            .isLength({min:3}).withMessage('Channel name length should be greater than 3')
            .isLength({max:48}).withMessage('Channel name length should be less than 48')
            .trim().toLowerCase(),
        body('visibility')
            .exists().withMessage('Visibility is required')
            .isIn([0,1]).withMessage('Visibility is invalid'),
        body('description')
            .exists().withMessage('Channel Description is required')
            .matches(/[a-zA-Z0-9\\s]/)
            .withMessage('Description should be alphanumeric.'),
        body('channelArt')
            .optional()
            .isBase64().withMessage('Channel logo is invalid')
    ])
}