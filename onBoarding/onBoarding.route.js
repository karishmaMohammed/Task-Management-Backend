const express = require('express');
const memberCtrl = require('./onBoarding.controller');
const { authenticateToken } = require('../middlewares/authenticator');

const router = express.Router();

router.route('/register').post(memberCtrl.register);
router.route('/login').post(memberCtrl.login);
router.route('/verify-member').post(authenticateToken, memberCtrl.verifyMember);
router.route('/edit-details').post(authenticateToken, memberCtrl.editProfileDetails);    
router.route('/change-password').post(authenticateToken, memberCtrl.changePassword);

module.exports = router;    