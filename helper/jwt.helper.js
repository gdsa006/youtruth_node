const { sign, verify, decode } = require("jsonwebtoken")

const signOps = {
    algorithm:'HS512',
    subject:'auth',
    audience:'client',
    issuer:'video-stream'
}

const jwtSecret = 'aXRzYXNlY3JldA==';

let generateToken = async (data) => {
    let token = await sign(data, jwtSecret, signOps);
    return token;
}

let generateTokenWithExpiry = async (data, expiry = "1800s") => {
    console.log(data)
    let token = await sign(data, jwtSecret, {...signOps,expiresIn: expiry});
    return token;
}

let validateToken = (token) => {
    let isValid=false, data={}, message=undefined;
    try {
        verify(token, jwtSecret, signOps);
        data = decode(token)
        isValid=true;
    } catch(error) {
        throw new Error("Token has expired")
    }
    return { isValid, message, data }
}

module.exports = {
    generateToken,
    generateTokenWithExpiry,
    validateToken
}