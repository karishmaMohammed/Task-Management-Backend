const mongoose = require("mongoose");

const taskTemplateSchema = new mongoose.Schema(
    {
        member_id:{type: mongoose.Types.ObjectId, ref: 'member_details'},
        input_type: { type: String },
        order: { type: Number },
        placeholder: { type: String },
        is_default: { type: Boolean },
        value: {type: mongoose.Schema.Types.Mixed},
        field_name: { type: String },
        description: { type: String },
        is_mandatory: { type: Boolean },
    },
    {
        timestamps: true,
    }
);

taskTemplateSchema.index({ member_id: 1 });

const taskTemplateFieldModel = mongoose.model(
    'task_templates',
    taskTemplateSchema
);
module.exports = { taskTemplateFieldModel };