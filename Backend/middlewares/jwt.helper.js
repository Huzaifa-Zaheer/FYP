const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');

const verifySocketToken = async (token) => {
    if (!token) throw new Error('Token missing');

    const isBlacklisted = await blackListTokenModel.findOne({ token });
    if (isBlacklisted) throw new Error('Token is blacklisted');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
};

module.exports = { verifySocketToken };