const mongoose = require('mongoose');

const taskActivityLogSchema = new mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'task_managements',
    },
    updatedBy: { type: mongoose.Schema.Types.Mixed },
    prevObj: { type: mongoose.Schema.Types.Mixed },
    newObj: { type: mongoose.Schema.Types.Mixed },
    member_id: {type: mongoose.Types.ObjectId, ref: 'member_details' },
}, {
    timestamps: true,
});


taskActivityLogSchema.index([{ task_id: 1 }]);

const taskActivityLogModel = mongoose.model('task_activity_logs', taskActivityLogSchema);

module.exports = { taskActivityLogModel };