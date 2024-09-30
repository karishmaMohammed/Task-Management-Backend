const { taskSequenceModel } = require('../models/taskSequence');
const { notificationModel } = require('../models/notification');

const generateSeqId = async (taskTile, memberId) => {
    try {
        // Get the first letter of the task title
        const firstLetter = taskTile.charAt(0).toUpperCase();

        // Find and update the sequence number in the database
        const seqRecord = await taskSequenceModel.findOneAndUpdate(
            { member_id: memberId, task_title: taskTile },
            { $inc: { task_seq_id: 1 } },  // Increment the sequence ID in the DB
            { upsert: true, new: true }    // Create a new record if none exists
        );

        // Use the updated task sequence number from the database
        const formattedCount = seqRecord.task_seq_id.toString().padStart(3, '0');

        // Return the unique seqId in the desired format
        return `${firstLetter}-${formattedCount}`;
    } catch (error) {
        console.log('Something went wrong!', error);
    }
};

const createNotification = async(seq_id, task_title, mem_id, task_id, notification_title, memberName, notify_type) => {
    try {
        const notifications = await notificationModel.create({
                    ticket_sequence_id: sequence_id,
                    ticket_id,
                    notification_title,
                    ticket_title : ticketTitle,
                    member_id : mem_id,
                    organization_id: orgId,
                    notify_type,
                    member_photo: memberPhoto,
                    member_name: memberName,
                    is_read: 0,
                });
    } catch (error) {
        console.log('something went wrong!', error)
    }
}


module.exports={
    generateSeqId,
    createNotification
}