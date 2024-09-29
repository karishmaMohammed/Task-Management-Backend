const mongoose = require('mongoose');


const taskSequence = new  mongoose.Schema({
   task_title:{type: String,  required: true},
    task_seq_id: {type: Number, default: 0},
    member_id:{type: mongoose.Types.ObjectId, ref: 'member_details'},
}, {
    timestamps: true,
});

taskSequence.index({ member_id: 1 });

const taskSequenceModel = mongoose.model('task_sequence', taskSequence);

module.exports = { taskSequenceModel };