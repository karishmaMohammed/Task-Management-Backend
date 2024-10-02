const express = require('express');
const taskTempCtrl = require('./taskTemplate.controller');
const { authenticateToken } = require('../middlewares/authenticator');

const router = express.Router();

router.route('/create-form-ele').post(authenticateToken, taskTempCtrl.createFormFields);
router.route('/get-form-ele').get(authenticateToken, taskTempCtrl.getFormFields);
router.route('/create-default-fields').post(authenticateToken, taskTempCtrl.createDefaultFields);
router.route('/create-task-template').post(authenticateToken, taskTempCtrl.createTaskTemplate);
router.route('/get-task-template').get(authenticateToken, taskTempCtrl.getTaskTemplate);

module.exports = router;