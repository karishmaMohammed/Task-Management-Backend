const { taskTemplateCustomFieldsModel } = require('../models/taskTemplateCustom'); //member_id
const { taskTemplateDefaultFieldsModel } = require('../models/taskTemplateDefault');
const { formFieldsModel } = require('../models/formFields');

async function createFormFields(req, res){
    let responseData;
    try {
        const { input_type, icon, display_type,placeholder} = req.body;
        const customFields = await formFieldsModel.create({
            input_type,icon,display_type,placeholder});
        if (customFields._id) {
            responseData = {
                meta: {
                    code: 200,
                    success: true,
                    message: 'SUCCESS',
                },
                data: customFields._id,
            };

            return res.status(responseData.meta.code).json(responseData);
        }
        
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
        const formFields = await formFieldsModel.find({}, {
            _id: 1, input_type: 1, display_type: 1, icon: 1, placeholder: 1});
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'SUCCESS',
            },
            form_fields: formFields,
        };

        return res.status(responseData.meta.code).json(responseData);
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
    //task title, description, owner, priority, due date
    let responseData;
    try {
        const {      
            input_type,
            order,
            placeholder,
            is_default,
            value,
            field_name,
            description,
            display_name,
            is_mandatory,
            options
            } = req.body;
    
            const taskDefaultFields = await taskTemplateDefaultFieldsModel.create(req.body)
            if(taskDefaultFields._id){
                responseData = {
                    meta: {
                        code: 200,
                        success: true,
                        message: 'SUCCESS',
                    },
                  
                };
        
                return res.status(responseData.meta.code).json(responseData);
            } 
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
        const { data } = req.body;
       const customData =  JSON.parse(data)
        // get default fields
        // delete before fields with member_id
        // save custome data with member_id
        await Promise.all([taskTemplateDefaultFieldsModel.find({},{_id:0}),
             taskTemplateCustomFieldsModel.findOneAndDelete({member_id: req.member._id})]);
       const customFields = await taskTemplateCustomFieldsModel.create( 
        customData.map((item) => ({
            ...item,
            member_id: req.member._id
        })))
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'SUCCESS',
            },
            data:{
                template : customFields._id
            }
        };

        return res.status(responseData.meta.code).json(responseData);
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

async function getTaskTemplate(req, res){
    let responseData;
    try {
        // form elements, def, cus
        const [formEle, defFields, customeData] = await Promise.all([
            formFieldsModel.find({},{input_type:1,icon :1,
                display_type:1,placeholder:1, _id:0}),
            taskTemplateDefaultFieldsModel.find({}, {_id:0}),
            taskTemplateCustomFieldsModel.find({member_id: req.member._id})
        ]);
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'SUCCESS',
            },
            data:{
                form_elements: formEle,
                def_cust_fields: [...defFields, ...customeData]
            }
        };

        return res.status(responseData.meta.code).json(responseData);

        
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
    createTaskTemplate,
    getTaskTemplate
}