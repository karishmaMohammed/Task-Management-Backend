const mongoose = require('mongoose');

const formFieldsSchema = new mongoose.Schema(
    {
        input_type: { type: String },
        icon: { type: String },
        display_type: { type: String },
        placeholder: { type: String },
    },
    {
        timestamps: true,
    },
);


const formFieldsModel = mongoose.model('form_fields', formFieldsSchema);
module.exports = { formFieldsModel };
