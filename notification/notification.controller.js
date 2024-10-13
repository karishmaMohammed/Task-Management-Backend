const { notificationModel } = require("../models/notification");
const { taskActivityLogModel } = require('../models/taskActivityLog');

async function getNotifications(req, res) {
  let responseData;
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

    const skip = (page - 1) * size;

    const [allNotification, allCount, unRead, countOfUnread] = await Promise.all([
      notificationModel
        .find({ member_id: req.member._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size),
      notificationModel.countDocuments({ member_id: req.member._id }),
      notificationModel
        .find({
          $and: [{ member_id: req.member._id }, { is_read: 0 }],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size),
      notificationModel.countDocuments({
        $and: [{ member_id: req.member._id }, { is_read: 0 }],
      }),
    ]);
    const responseData = {
      meta: {
        code: 200,
        success: true,
        message: "SUCCESS",
      },
      data: {
        all_notification: allNotification || [], // Ensure it's an array
        all_count: allCount || 0,                // Ensure count is a number
        un_read_notification: unRead || [],      // Ensure it's an array
        un_read_count: countOfUnread || 0,       // Ensure count is a number
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.log(error);
    responseData = {
      meta: {
        code: 200,
        success: false,
        message: "Something went wrong!",
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  }
}

async function markNotificationsRead(req, res) {
  let responseData;
  try {
    const { id } = req.query;
    let readNotify;
    if (id) {
      readNotify = await notificationModel.findByIdAndUpdate(
        {
          _id: id,
          member_id: req.member._id,
        },
        { $set: { is_read: true } }
      );
    } else {
      readNotify = await notificationModel.updateMany(
        {
          member_id: req.member._id
        },
        { $set: { is_read: true } }
      );
    }
  
    const responseData = {
      meta: {
        code: 200,
        success: true,
        message: "SUCCESS",
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.log(error);
    responseData = {
      meta: {
        code: 200,
        success: false,
        message: "Something went wrong!",
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  }
}


// activity logs
async function getTaskActivityLogs(req, res){
    let responseData;
    try {
        const { task_id } = req.query;
        const changeLogs = await taskActivityLogModel.find({ _id:task_id,
            member_id: req.member._id }, {
            updatedBy: 1, prevObj: 1,
            newObj: 1, createdAt: 1, updatedAt: 1
        });
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'SUCCESS',
            },
            data: {
                task_activity_logs: changeLogs,
            }
        };
        return res.status(responseData.meta.code).json(responseData); 
    } catch (error) {
        console.log(error);
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: 'Something went wrong',
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    }
}
module.exports = {
  getNotifications,
  markNotificationsRead,
  getTaskActivityLogs
};
