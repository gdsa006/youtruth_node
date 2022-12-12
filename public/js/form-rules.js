
// custom jquery validator

$.validator.addMethod(
    "pattern",
    function(value, element, regexp) {
        var re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
    },
    "Invalid input pattern"
);

$.validator.addMethod('accept',
function(value, element, regexp){
    if(element.files.length > 0){
        let {type} = element.files[0];
        
        if(regexp.split(',').includes(type))
            return true;
        else 
            return false;
    } else if(!element.required)
        return true;
     else 
        return false;
},
"Invalid file format")


$.validator.addMethod('filesize',
function(value, element, regexp){

    if(element.files.length > 0){
        let {size} = element.files[0];
        if(size <= regexp)
            return true;
        else 
            return false;
    } else if(!element.required)
        return true;
    else 
        return false;
},
"File size exceeded")

// form rules

let formRule = {
    login : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            error.insertAfter(element);
        },
        rules : {
            email:{
                required:true,
                email:true
            },
            password:{
                required:true
            }
        },
        messages:{
            email:{
                required:'Email is required',
                email:'Enter a valid email'
            },
            password:{
                required:'Password is required'
            }
        }
    },
    resetPasswordEmailForm : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            error.insertAfter(element);
        },
        rules : {
            email:{
                required:true,
                email:true
            }
        },
        messages:{
            email:{
                required:'New password is required',
                email:'Email is not valid.'
            }
        }
    },
    resetPassword : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            error.insertAfter(element);
        },
        rules : {
            npassword:{
                required:true
            },
            cpassword:{
                required:true,
                equalTo:'#npassword'
            },
            _csrf:{
                required:true
            }
        },
        messages:{
            npassword:{
                required:'New password is required'
            },
            cpassword:{
                required:'Confirm Password is required',
                equalTo:'Confirm password should match with the new password'
            },
            _csrf:{
                required:'Token is required'
            }
        }
    },
    registerForm : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            if(element[0].id == 'tnc'){
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
            
        },
        rules : {
            fname:{
                required:true,
                minlength:3, 
                maxlength:45,
                pattern:'[a-zA-Z]'
            },
            lname:{
                required:true,
                minlength:3, 
                maxlength:45
            },
            dob:{
                required:true
            },
            gender:{
                required:true
            },
            email:{
                required:true,
                email:true
            },
            cpassword:{
                required:true,
                equalTo:'#password'
            },
            password:{
                required:true,
                minlength:8,
                maxlength:12
            },
            mobile : {
                required : true,
                minlength : 10,
                maxlength : 10,
                pattern:'[0-9]'
            },
            std : {
                required : true
            },
            tnc : {
                required : true
            }
        },
        messages:{
            fname:{
                required:'First Name is required',
                minlength:'First name length should be greater than 3',
                maxlength:'First name length should be less than 45',
                pattern:'invalid name'
            },
            lname:{
                required:'Last Name is required',
                minlength:'First name length should be greater than 3',
                maxlength:'First name length should be less than 45'
            },
            dob:{required:'Date of Birth is required'},
            gender:{required:'Gender is required'},
            email:{
                required:'Email is required',
                Email:'Email should be valid'
            },
            cpassword:{
                required:'Confirm Password is required',
                equalTo:'Confirm Password should same as password.'
            },
            password:{
                required:'Password is required',
                minlength:'Password length should be greater than 8',
                maxlength:'Password length should be less than 12'
            },
            mobile : {
                required : 'Mobile is required',
                minlength : 'Mobile length should be minimum 10 digit ',
                maxlength : 'Mobile length should be maximum 10 digit',
                pattern: 'Mobile contains only number[0-9]'
            },
            std : {
                required : 'STD code is required',
            },
            tnc : {
                required : 'Terms & condition is required',
            }
        }
    },
    profileUpdatePassword : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            error.insertAfter(element);
        },
        rules : {
            opassword:{
                required:true
            },
            npassword:{
                required:true
            },
            cpassword:{
                required:true,
                equalTo:'#npassword'
            },
            otp:{
                required:true
            }
        },
        messages:{
            opassword:{
                required:'Current password is required'
            },
            npassword:{
                required:'New password is required'
            },
            cpassword:{
                required:'Confirm Password is required',
                equalTo:'Confirm password is not same'
            },
            otp:{
                required:'OTP is required'
            }
        }
    },
    updateChannel : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            error.insertAfter(element);
        },
        rules : {
            name:{
                required:true
            },
            description:{
                required:true
            },
            visibility:{
                required:true
            },
            channelId:{
                required:true
            }
        },
        messages:{
            name:{
                required:'Channel name is required'
            },
            description:{
                required:'Channel description is required'
            },
            visibility:{
                required:'Visibility is required'
            },
            channelId:{
                required:'Channel Id is required'
            }
        }
    },
    createChannel : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            if(element[0].id == 'channelArt'){
                error.insertAfter(element.parent().parent());
            } else {
                error.insertAfter(element);
            }
        },
        rules : {
            name:{
                required:true
            },
            description:{
                required:true
            },
            visibility:{
                required:true
            },
            channelArt:{
                required:true
            }
        },
        messages:{
            name:{
                required:'Channel name is required'
            },
            description:{
                required:'Channel description is required'
            },
            visibility:{
                required:'Visibility is required'
            },
            channelArt:{
                required:'Channel logo is required'
            }
        }
    },
    uploadVideo : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            if(element[0].id == 'videoFile'){
                error.insertAfter(element.parent().parent());
            } else if(element[0].id == 'videoCover'){
                error.insertAfter(element.parent().parent());
            } else {
                error.insertAfter(element);
            }
        },
        rules : {
            channelId:{
                required:true
            },
            videoTitle:{
                required:true
            },
            categoryId:{
                required:true
            },
            videoDescription:{
                required:true
            },
            visibility:{
                required: true
            },
            videoFile:{
                required: true,
                accept: "video/mp4,video/webm,video/ogg",
                filesize: 200*1024*1024
            },
            videoCover : {
                required: false,
                accept: 'image/png,image/gif,image/jpeg,image/jpg',
                filesize: 1024*1024
            }
        },
        messages:{
            channelId:{
                required:'Channel is required'
            },
            videoTitle:{
                required:'Title is required'
            },
            categoryId:{
                required:'Category is required'
            },
            videoDescription:{
                required:'Description is required'
            },
            visibility:{
                required: 'Visibility is required'
            },
            videoFile:{
                required: 'Video file is required',
                accept: "Attachment should be video file",
                filesize: `Video file size should be less than 200MB`
            },
            videoCover : {
                accept: "Attachment should be image file",
                filesize: `Video file size should be less than 1MB`
            }
        }
    },
    updateVideo : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            error.insertAfter(element);
        },
        rules : {
            channelId:{
                required:true
            },
            videoTitle:{
                required:true
            },
            categoryId:{
                required:true
            },
            videoDescription:{
                required:true
            },
            visibility:{
                required: true
            }
        },
        messages:{
            channelId:{
                required:'This filed is required'
            },
            videoTitle:{
                required:'This filed is required'
            },
            categoryId:{
                required:'This filed is required'
            },
            videoDescription:{
                required:'This filed is required'
            },
            visibility:{
                required: 'This filed is required'
            }
        }
    },
    updateBioForm : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            error.insertAfter(element);
        },
        rules : {
            bio:{
                required:true,
                minlength:10,
                maxlength:250
            }
        },
        messages:{
            bio:{
                required:'This filed is required',
                minlength:'This field contains minimum 50 characters',
                maxlength:'This field contains maximum 250 characters'
            }
        }
    },
    updateProfileForm : {
        errorElement: 'span',
        errorClass:'is-invalid',
        errorPlacement: function(error, element) {
            error[0].className='is-invalid invalid-feedback';
            error.insertAfter(element);
        },
        rules : {
            firstName:{
                required:true
            },
            lastName:{
                required:true
            },
            dob:{
                required:true
            },
            gender:{
                required:true
            },
            address : {
                required : true
            }
        },
        messages:{
            firstName:{
                required:'This filed is required',
            },
            lastName:{
                required:'This filed is required',
            },
            dob:{
                required:'This filed is required',
            },
            gender:{
                required:'This filed is required',
            },
            address:{
                required:'This filed is required',
            }
        }
    }
}
