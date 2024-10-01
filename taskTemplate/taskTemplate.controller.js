const { taskTemplateFieldModel } = require('../models/taskTemplate');

async function createFormFields(req, res){
    let responseData;
    try {
        
    } catch (error) {
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: "Something went wrong",
            },
        };

        return res.status(responseData.meta.code).json(responseData); 
    }
}

async function getFormFields(req, res){
    let responseData;
    try {
        
    } catch (error) {
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: "Something went wrong",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    }
}

async function createDefaultFields(req, res){
    let responseData;
    try {
        
    } catch (error) {
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: "Something went wrong",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    }
}

async function createTaskTemplate(req, res){
    let responseData;
    try {
        // get default fields
        // delete before fields with member_id
        // save custome data with member_id
    } catch (error) {
        responseData = {
            meta: {
                code: 200,
                success: false,
                message: "Something went wrong",
            },
        };

        return res.status(responseData.meta.code).json(responseData);
    }
}

module.exports={
    createFormFields,
    getFormFields,
    createDefaultFields,
    createTaskTemplate
}