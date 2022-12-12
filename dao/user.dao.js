const {User, Role, UserRoleMapping } = require("../database/model");

const logger = require('../config/logger').getLogger('userDao')

module.exports = {
    getUserByEmail : async (email) => {
        let user = await User.findOne({where:{email}, attributes:['avatar','firstName','lastName','gender','dob','email','mobile','bio','address','id','createdAt','status','std']})
        return user ? user.toJSON() : undefined;
    },
    getUserById : async (userId) => {
        let user = await User.findOne({where:{id:userId}, attributes:['avatar','firstName','lastName','gender','email','bio','createdAt','id']})
        return user ? user.toJSON() : undefined;
    },
    getUserPasswordByEmail : async (email) => {
        logger.info(email)
        let user = await User.findOne({where:{email}, attributes:['email','password']});
        return user ? user.toJSON() : undefined;
    },
    updatePasswordByEmail : async (p, e) => {
        logger.info(e, p)
        await User.update({password:p},{where : {email : e}});
    },
    authenticateUserByEmail : async (email) => {
        let user = await User.findOne({
            where : {email}, 
            attributes : ['firstName','lastName','email','id','password','active','status'], 
            include: {
                model : UserRoleMapping, 
                attributes:['roleId'], 
                where : { active:1 },
                include : {
                    model: Role,
                    attributes : ['name']
                }
            }
        });
        return user ? user.toJSON(): undefined;
    }
}