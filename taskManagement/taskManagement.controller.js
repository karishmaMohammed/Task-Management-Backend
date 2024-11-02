const { taskManagementModel } = require("../models/taskManagement");
const { generateSeqId, createNotification } = require("../middlewares/helper");
const { taskActivityLogModel } = require("../models/taskActivityLog");
const { formFieldsModel } = require("../models/formFields");

async function createFormFields(req, res) {
  let responseData;
  try {
    const { input_type, icon, display_type, placeholder } = req.body;
    const customFields = await formFieldsModel.create({
      input_type,
      icon,
      display_type,
      placeholder,
    });
    if (customFields._id) {
      responseData = {
        meta: {
          code: 200,
          success: true,
          message: "SUCCESS",
        },
        data: customFields._id,
      };

      return res.status(responseData.meta.code).json(responseData);
    }
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

async function getFormFields(req, res) {
  let responseData;
  try {
    const formFields = await formFieldsModel.find(
      {},
      {
        _id: 1,
        input_type: 1,
        display_type: 1,
        icon: 1,
        placeholder: 1,
      }
    );
    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "SUCCESS",
      },
      form_fields: formFields,
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

// create task
async function createTask(req, res) {
  let responseData;
  try {
    const {
      task_title,
      description,
      due_date,
      custom_data,
      priority,
      main_task_seq_id,
    } = req.body;

    // Try parsing custom_data safely
    let customData;
    try {
      customData = JSON.parse(custom_data);
    } catch (err) {
      return res.status(400).json({
        meta: {
          code: 400,
          success: false,
          message: "Invalid custom_data format",
        },
      });
    }

    const memId = req.member._id;
    const taskSeqId = await generateSeqId(task_title, memId);
    console.log(taskSeqId, "taskSeqId");

    // validation => member can't add same task title
    const existTaskTile = await taskManagementModel.findOne(
      {
        created_by: memId,
        task_title: task_title,
      },
      { task_title: 1 }
    );

    if (existTaskTile) {
      responseData = {
        meta: {
          code: 409,
          success: false,
          message: "Member can't add the same task title",
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }

    const task = await taskManagementModel.create({
      created_by: memId,
      task_title,
      description,
      task_sequence_id: taskSeqId,
      main_task_seq_id,
      due_date,
      task_status: "draft",
      priority,
      custom_data: customData,
    });

    const notification_title = `Task "${task.task_title}" has been created`;
    const notify_type = "task_created";
    createNotification(
      taskSeqId,
      memId,
      task._id,
      notification_title,
      notify_type
    );

    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "Task created successfully!",
      },
    };
    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.error("Error creating task:", error);
    responseData = {
      meta: {
        code: 500,
        success: false,
        message: "Something went wrong in creating task",
      },
    };
    return res.status(responseData.meta.code).json(responseData);
  }
}

// list of task need to add pagination
async function getTaskList(req, res) {
  let responseData;
  try {
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;
    const search = req.query.search || ""; 
    const result = await taskManagementModel.aggregate([
      {
        $match: {
          created_by: req.member._id,
          ...(search && {
            task_title: { $regex: search, $options: "i" },
          }),
        },
      },
      {
        $lookup: {
          from: "member_details",
          localField: "created_by",
          foreignField: "_id",
          as: "member_name",
        },
      },
      { $unwind: { path: "$member_name", preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          task_list: [
            {
              $project: {
                _id: 1,
                task_sequence_id: 1,
                task_title: 1,
                task_status: 1,
                priority: 1,
                due_date: 1,
                member_name: "$member_name.full_name",
              },
            },
            { $skip: skip },
            { $limit: limit },
          ],
          total_count: [
            { $count: "count" },
          ],
        },
      },
    ]);

    const taskList = result[0].task_list;
    const totalTasks = result[0].total_count[0]?.count || 0;
    const totalPages = Math.ceil(totalTasks / limit);

    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "Task list shown successfully!",
      },
      data: {
        task_list: taskList,
        total_pages: totalPages,
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    responseData = {
      meta: {
        code: 500,
        success: false,
        message: "Something went wrong",
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  }
}



//task details page
async function getTaskDetails(req, res) {
  let responseData;
  try {
    const { task_sequence_id } = req.params;

    const [taskDetails, subTask] = await Promise.all([
      taskManagementModel.aggregate([
        {
          $match: {
            created_by: req.member._id,
            task_sequence_id,
          },
        },
        {
          $lookup: {
            from: "member_details",
            localField: "created_by",
            foreignField: "_id",
            as: "member_name",
          },
        },
        { $unwind: { path: "$member_name", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            task_sequence_id: 1,
            description: 1,
            task_title: 1,
            task_status: 1,
            custom_data: 1,
            priority: 1,
            due_date: 1,
            member_name: "$member_name.full_name",
          },
        },
      ]),
      taskManagementModel.find(
        { created_by: req.member._id, main_task_seq_id:task_sequence_id },
        {
          task_title: 1,
          task_sequence_id: 1,
          main_task_seq_id: 1,
          task_status: 1,
          due_date: 1,
        }
      ),
    ]);
    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "Task details shown successfully!",
      },
      data: {
        task_details: taskDetails ? taskDetails[0]: [],
        sub_task: subTask ? subTask : []
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

async function editTaskDetails(req, res) {
  let responseData;
  try {
    const { task_id, prev_obj, new_obj } = req.body;
    const mem_id = req.member._id;
    const parsedPrevObj = JSON.parse(prev_obj);
    const parsedNewObj = JSON.parse(new_obj);

    // Step 1: Update the task and retrieve the new task document with `task_sequence_id`
    const [updatedTask, activityLog] = await Promise.all([
      taskManagementModel.findByIdAndUpdate(
        task_id,
        { $set: parsedNewObj },
        { new: true, fields: { task_sequence_id: 1 } }
      ),
      taskActivityLogModel.create({
        task_id,
        updatedBy: {
          member_id: mem_id,
          name: req.member.full_name,
        },
        prevObj: parsedPrevObj,
        newObj: parsedNewObj,
        member_id: req.member._id
      })
    ]);

    const seq_id = updatedTask?.task_sequence_id || null;

    // Step 2: Create notification asynchronously
    const notificationTitle = `${seq_id} Task has been edited`;
    const notifyType = "edit-task";

    createNotification(seq_id, mem_id, task_id, notificationTitle, notifyType);

    // Success response
    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "SUCCESS",
      },
    };
    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.error("Error editing task details:", error);

    responseData = {
      meta: {
        code: 500,
        success: false,
        message: "Something went wrong",
      },
    };
    return res.status(responseData.meta.code).json(responseData);
  }
}


async function editDefaultTaskDetails(req, res){
  let responseData;
  try {
    const { task_id, new_obj, prev_obj,updateData } = req.body;

        const updateObj = {};
        for (const key in updateData) {
            updateObj[key] = updateData[key];
        }
        console.log(updateObj)
        const [editedDetails, activityLogs] = await Promise.all([
          taskManagementModel.findOneAndUpdate(
            { _id: task_id },
            updateObj,{ new: true }), 
            taskActivityLogModel.create({
              task_id,
              updatedBy: {
                member_id: req.member._id,
                name: req.member.full_name,
              },
              prevObj: prev_obj,
              newObj: new_obj,
              member_id: req.member._id
            })]);

            responseData = {
              meta: {
                code: 200,
                success: true,
                message: "SUCCESS",
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

async function deleteTask(req, res) {
  let responseData;
  try {
    const { task_id } = req.body;
    const delTask = await taskManagementModel.findByIdAndDelete({
      _id: task_id,
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
  createFormFields,
  getFormFields,
  createTask,
  getTaskList,
  getTaskDetails,
  editTaskDetails,
  editDefaultTaskDetails,
  deleteTask,
};
