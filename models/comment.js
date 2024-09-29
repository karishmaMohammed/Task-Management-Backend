const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
member_id : {type: mongoose.Types.ObjectId, ref:'member_details'},
task_id : {type : mongoose.Types.ObjectId, ref :'task_managements'},
comment_message : { type: String},
},{
    timestamps: true
});

commentSchema.index({ member_id :1});

const commentsModel = mongoose.model('comments', commentSchema);

module.exports = { commentsModel };