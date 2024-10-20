const express = require('express');
const notifiCtrl = require('./notification.controller');
const { authenticateToken } = require('../middlewares/authenticator');

const router = express.Router();

router.route('/get-notifications').get(authenticateToken, notifiCtrl.getNotifications);
router.route('/mark-read').post(authenticateToken, notifiCtrl.markNotificationsRead);
router.route('/get-task-acti-logs').get(authenticateToken, notifiCtrl.getTaskActivityLogs);

module.exports = router;