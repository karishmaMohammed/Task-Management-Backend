const { taskManagementModel } = require('../models/taskManagement');
const { generateSeqId, createNotification } = require('../middlewares/helper');
const { taskActivityLogModel } = require('../models/taskActivityLog');

async function createTask(req, res){
    let responseData;
    try {
        const { task_title,description,due_date } = req.body;
        const memId = req.member._id;
        const taskSeqId = generateSeqId(task_title,memId);
        // validation => member can't add same task title
        const existTaskTile = await taskManagementModel.findOne({created_by:memId },
             {task_title:1});
        if(existTaskTile.task_title){
            responseData = {
                meta: {
                    code: 200,
                    success: false,
                    message: "Member can't add same task title",
                },
            };
    
            return res.status(responseData.meta.code).json(responseData);
        }
        const task = await taskManagementModel.create({
            created_by : memId,task_title,description, 
            task_sequence_id:taskSeqId,
            due_date,task_status : 'draft', priority:false
        });
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: "Task created successfully!",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    } catch (error) {
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: "Something went wrong",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    }
}
// list of task need to add pagination
async function getTaskList(req, res){
    let responseData;
    try {
        const taskList = await taskManagementModel.aggregate([
            {
                $match:{
                    created_by: req.member._id
                }
            },
            {
                $lookup:{
                    from: 'member_details',
                    localField: 'created_by',
                    foreignField: '_id',
                    as: 'member_name'
                }
            },
            { $unwind: { path: '$member_name', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    task_sequence_id:1,
                    task_title: 1,
                    task_status:1,
                    priority:1,
                    due_date:1,
                    member_name: '$member_name.full_name',
                },
            },
        ]);
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: "Task list shown successfully!",
            },
            data:{
                task_list : taskList ? taskList[0] : []
            }
        };

        return res.status(responseData.meta.code).json(responseData);
        
    } catch (error) {
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: "Something went wrong",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    }
}

//task details page
async function getTaskDetails(req, res){
    let responseData;
    try {
        const { task_sequence_id } = req.params;
        const taskDetails = await taskManagementModel.aggregate([
            {
                $match:{
                    created_by: req.member._id,
                    task_sequence_id
                }
            },
            {
                $lookup:{
                    from: 'member_details',
                    localField: 'created_by',
                    foreignField: '_id',
                    as: 'member_name'
                }  
            },
            { $unwind: { path: '$member_name', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    task_sequence_id:1,
                    description:1,
                    task_title: 1,
                    task_status:1,
                    priority:1,
                    due_date:1,
                    member_name: '$member_name.full_name',
                },
            },
        ]);
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: "Task details shown successfully!",
            },
            data:{
                task_details : taskDetails ? taskDetails[0] : []
            }
        };

        return res.status(responseData.meta.code).json(responseData);
    } catch (error) {
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: "Something went wrong",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    }
}

async function editTaskDetails(req, res) {
    let responseData;
    try {
        const { task_id, prev_obj, new_obj, task_title } = req.body;
        const mem_id = req.member._id;
        const parsedPrevObj = JSON.parse(prev_obj);
        const parsedNewObj = JSON.parse(new_obj);

        // Fetch the task details first
        const taskDetails = await taskManagementModel.findById({_id:task_id});
        if (!taskDetails) {
            responseData = {
                meta: {
                    code: 500, // Set correct error code
                    success: false,
                    message: 'Task not found',
                },
            };
            return res.status(responseData.meta.code).json(responseData);
        }

        // Perform multiple actions concurrently using Promise.all
        const [updateTicket, creating, sequenceId] = await Promise.all([
            taskManagementModel.findByIdAndUpdate(
                { _id: task_id },
                { ...taskDetails, ...parsedNewObj }, // Update only the new fields
                { new: true } // Return updated document
            ),
            taskActivityLogModel.create({
                task_id,
                updatedBy: {
                    member_id: mem_id,
                    name: req.member.full_name,
                },
                prevObj: parsedPrevObj,
                newObj: parsedNewObj,
            }),
            taskManagementModel.findOne({ _id: task_id }, { task_sequence_id: 1, _id: 0 }),
        ]);

        // Use the task_sequence_id from the DB
        let seq_id = sequenceId ? sequenceId.task_sequence_id : null;
        const memberName = req.member.full_name;
        const notify_type = 'edit-task';

        // Set notification title based on task changes
        const notification_title = `Task "${task_title}" has been edited`;

        // Create notification after editing the task
        createNotification(seq_id, task_title, mem_id, task_id, notification_title, memberName, notify_type);

        // Success response
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'SUCCESS',
            },
        };
        return res.status(responseData.meta.code).json(responseData);
    } catch (error) {
        console.error('Error editing task details:', error);
        
        responseData = {
            meta: {
                code: 500, // Set correct error code
                success: false,
                message: 'Something went wrong',
            },
        };
        return res.status(responseData.meta.code).json(responseData);
    }
}

async function deleteTask(req, res){
    let responseData;
    try {
        const { task_id } = req.body;
        const delTask = await taskManagementModel.findByIdAndDelete({
            _id: task_id
        });
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: "Task deleted successfully!",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    } catch (error) {
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: "Something went wrong",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    }
}


module.exports = {
    createTask,
    getTaskList,
    getTaskDetails,
    editTaskDetails,
    deleteTask
}