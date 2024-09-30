const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
   
    member_id: {type: mongoose.Types.ObjectId, ref: 'member_details'}, 
    task_id : {type : mongoose.Types.ObjectId, ref :'task_managements'},
    notification_title: {type : String},
    is_read: {type : Boolean},
    notification_message: { type: String},
    
}, {
    timestamps: true,
});


notificationSchema.index({ member_id: 1}, {task_id:1 });

const notificationModel = mongoose.model('notifications', notificationSchema);
module.exports = { notificationModel };
