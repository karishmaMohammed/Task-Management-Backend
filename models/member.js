const mongoose = require('mongoose');

// create user schema
const memberDetailsSchema = new mongoose.Schema({
    full_name: { type: String},
    email: { type: String, required: true, unique: true },
    password: { type: String},
    gender:{ type: String},
    phone_number:{ type: String},
    id_token: { type: String},
    is_verified: { type: Boolean },
    mode: { type: Boolean} //dark mode lite mode
    // is_admin: { type: Boolean, index: true },
   
}, {
    timestamps: true,
});


memberDetailsSchema.index({ email: 1 });


// create user mode
const memberDetailsModel = mongoose.model('member_details', memberDetailsSchema);
module.exports = { memberDetailsModel };
