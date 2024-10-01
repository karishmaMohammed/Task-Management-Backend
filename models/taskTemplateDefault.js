const mongoose = require("mongoose");

const taskTemplateDefaultFieldsSchema = new mongoose.Schema(
    {
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



const taskTemplateDefaultFieldsModel = mongoose.model(
    'task_template_default_fields',
    taskTemplateDefaultFieldsSchema
);
module.exports = { taskTemplateDefaultFieldsModel };