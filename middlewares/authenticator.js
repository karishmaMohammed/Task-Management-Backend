const jwt = require('jsonwebtoken');
const { memberDetailsModel } = require('../models/member');


async function authenticateToken(req, res, next) {
    const tokenAuth = req.headers['x-auth-token'];
    const config = req.app.get('config');

    try {
        if (tokenAuth) {
            const payload = jwt.verify(tokenAuth, config.jwt_secret);
            
            if (payload.userId) {
                const member = await memberDetailsModel.findOne({ _id: payload.userId });
               
                if (member && member._id) {
                    if (member.is_verified || ['/member/verify-member'].includes(req.originalUrl)) {
                        req.member = member;
                        return next();
                    } else {
                        return res.status(403).json({
                            meta: {
                                code: 403,
                                success: false,
                                message: 'Member not verified',
                            },
                        });
                    }
                } else {
                    return res.status(404).json({
                        meta: {
                            code: 404,
                            success: false,
                            message: 'Member not found',
                        },
                    });
                }
            } else {
                return res.status(401).json({
                    meta: {
                        code: 401,
                        success: false,
                        message: 'Invalid token payload',
                    },
                });
            }
        } else {
            return res.status(401).json({
                meta: {
                    code: 401,
                    success: false,
                    message: 'No token provided',
                },
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(403).json({
            meta: {
                code: 403,
                success: false,
                message: 'Invalid token',
            },
        });
    }
}

module.exports={
    authenticateToken
}