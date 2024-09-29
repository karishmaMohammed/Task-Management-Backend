const { taskManagementModel } = require('../models/taskManagement');
const { generateSeqId } = require('../middlewares/helper');

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
        const { task_sequence_id } = req.query;
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


async function updateTask(req, res){
    let responseData;
    try {
        const { task_id, task_title, due_date } = req.body;
        
        
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
    getTaskDetails
}