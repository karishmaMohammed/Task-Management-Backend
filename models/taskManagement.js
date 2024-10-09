const mongoose = require('mongoose');

const taskManagementSchema = new mongoose.Schema({
    created_by:{type:mongoose.Types.ObjectId, ref:'member_details'}, //for now let this be member fullName
    task_title: { type: String, required: true, unique: true },
    description: { type: String},
    task_sequence_id: {type: String},
    main_task_seq_id: {type: String}, //key filled only when sub tasks been added
    task_status: {  type: String,
        enum: ["draft", "pending", "progress","completed"],
        default: "draft" },
    priority:{ type: Boolean},
    due_date:{ type: String},
    custom_data: { type: mongoose.Schema.Types.Mixed },
}, {
    timestamps: true,
});


taskManagementSchema.index({ task_title: 1}, {created_by:1 });

const taskManagementModel = mongoose.model('task_managements', taskManagementSchema);
module.exports = { taskManagementModel };
