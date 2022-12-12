const { UserOtp } = require("../database/model");

module.exports = {
    getOtpByEmail : async (email) => {
        let otp = await UserOtp.findOne({
            where:{email, active:1}, 
            attributes : ['email', 'otp', 'expiryTime', 'expiryUnit','id'],
            order : [['createdAt', 'DESC']]
        })
        return otp ? otp.toJSON() : null;
    },
    inactiveOTP : async (id) => {
        await UserOtp.update({active:0},{where:{id}});
    },
    createOtp : async (email, otp) => {
        await UserOtp.create({email, otp});
    }
}