const { commentsModel } = require('../models/comment');

async function createComment(req, res){
    let responseData;
    try {
        const { comment_message, task_id} = req.body;
        const comment = await commentsModel.create({
            member_id: req.member._id,comment_message, task_id 
        });
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Comment created successfully',
            },
        };
        return res.status(responseData.meta.code).json(responseData);
        
    } catch (error) {
        console.log(error);
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: 'Something went wrong',
            },
        };
        return res.status(responseData.meta.code).json(responseData);
    }
}

async function getComment(req, res){
    let responseData;
    try {
        const { task_id } = req.query;
        const commentList = await commentsModel.aggregate([
            {
                $match:{
                    member_id: req.member._id,
                    task_id
                }
            },
            {
                $lookup:{
                    from: 'member_details',
                    localField: 'member_id',
                    foreignField: '_id',
                    as: 'member_name'
                }
            },
            { $unwind: { path: '$member_name', preserveNullAndEmptyArrays: true }},
            {
                $project:{
                    _id: 1,
                    comment_message:1,
                    member_name: '$member_name.full_name',
                }
            }
        ]);
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Comment list successfully',
            },
            data:{
                comment_list: commentList ? commentList[0] : []
            }
        };
        return res.status(responseData.meta.code).json(responseData);
        
    } catch (error) {
        console.log(error);
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: 'Something went wrong',
            },
        };
        return res.status(responseData.meta.code).json(responseData);
    }
}

async function deleteComment(req, res){
    let responseData;
    try {
        const { comment_id } = req.query;
        const delComment = await commentsModel.findByIdAndDelete({
            _id: comment_id
        });
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Comment deleted successfully!',
            },
        };
        return res.status(responseData.meta.code).json(responseData);
    } catch (error) {
        console.log(error);
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: 'Something went wrong',
            },
        };
        return res.status(responseData.meta.code).json(responseData);
    }
}
module.exports ={
    createComment,
    getComment,
    deleteComment
}