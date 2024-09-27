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
   
    // is_admin: { type: Boolean, index: true },
    // onBoardingStatus:{ type: String},
}, {
    timestamps: true,
});


memberDetailsSchema.index({ email: 1 });
// memberDetailsSchema.index({ is_verified: 1 });
// memberDetailsSchema.index({ is_admin: 1 });

// create user mode
const memberDetailsModel = mongoose.model('member_details', memberDetailsSchema);
module.exports = { memberDetailsModel };
