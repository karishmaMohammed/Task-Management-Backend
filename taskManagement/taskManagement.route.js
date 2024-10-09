const express = require('express');
const taskCtrl = require('./taskManagement.controller');
const { authenticateToken } = require('../middlewares/authenticator');

const router = express.Router();

router.route('/create-form-ele').post(taskCtrl.createFormFields);
router.route('/get-form-ele').get(authenticateToken, taskCtrl.getFormFields);
router.route('/create-task').post(authenticateToken, taskCtrl.createTask);
router.route('/get-task-list').get(authenticateToken, taskCtrl.getTaskList);
router.route('/get-task-details/:id').get(authenticateToken, taskCtrl.getTaskDetails);
router.route('/edit-task-details').post(authenticateToken, taskCtrl.editTaskDetails);
router.route('/del-task').get(authenticateToken, taskCtrl.deleteTask);

module.exports = router;