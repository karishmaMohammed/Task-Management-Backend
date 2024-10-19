const express = require('express');
const commentCtrl = require('./comment.controller');
const { authenticateToken } = require('../middlewares/authenticator');
 
const router = express.Router();

router.route('/create-comment').post(authenticateToken, commentCtrl.createComment);
router.route('/get-comment').get(authenticateToken, commentCtrl.getComment);
router.route('/del-comment').post(authenticateToken, commentCtrl.deleteComment);

module.exports = router;