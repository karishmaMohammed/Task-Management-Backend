const { memberDetailsModel } = require("../models/member");
const { notificationModel } = require("../models/notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function register(req, res) {
  let responseData;
  try {
    const { full_name, email, phone_number, password, gender } = req.body;

    if (!full_name || !email || !phone_number || !password || !gender) {
      responseData = {
        meta: {
          code: 400,
          success: false,
          message: "All fields are required!",
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }

    const existingUser = await memberDetailsModel.findOne({ email });
    if (existingUser) {
      responseData = {
        meta: {
          code: 400,
          success: false,
          message: "Email already registered!",
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userDetails = await memberDetailsModel.create({
      full_name,
      gender,
      email,
      phone_number,
      password: hashedPassword,
    });

    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "Your registered now login!",
      },
      data: {
        user_details: userDetails._id,
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.error(error);
    responseData = {
      meta: {
        code: 200,
        success: false,
        message: "Something went wrong!",
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  }
}

async function login(req, res) {
  let responseData;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      responseData = {
        meta: {
          code: 200,
          success: false,
          message: "Email and password are required!",
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }
    const user = await memberDetailsModel.findOne({ email });
    if (!user) {
      responseData = {
        meta: {
          code: 200,
          success: false,
          message: "Invalid email or password!",
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      responseData = {
        meta: {
          code: 200,
          success: false,
          message: "Invalid email or password!",
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "Login successfull!",
      },
      data: {
        user_token: token,
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.error(error);
    responseData = {
      meta: {
        code: 200,
        success: false,
        message: "Something went wrong!",
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  }
}

async function verifyMember(req, res) {
  let responseData;
  try {
    const result = await memberDetailsModel.findByIdAndUpdate(
      req.member._id,
      { is_verified: 1 },
      { new: true }
    );
    if (result) {
      responseData = {
        meta: {
          code: 200,
          success: true,
          message: "Member verified successfully.",
        },
        data: {
          email: req.member.email,
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }
  } catch (e) {
    console.log(e);
    responseData = {
      meta: {
        code: 200,
        success: false,
        message: "Internal server error",
      },
    };
    return res.status(responseData.meta.code).json(responseData);
  }
}

async function editProfileDetails(req, res) {
  let responseData;
  try {
    const { name, phone, gender, action } = req.body;
    let getDetails;
    if (action === "update") {
      const updatedDetails = await memberDetailsModel.findByIdAndUpdate(
        req.member._id,
        {
          full_name: name,
          phone_number: phone,
          gender,
        },
        { new: true }
      );
      console.log(updatedDetails, "updatedDetails")
    } else if (action === "get_info") {
      getDetails = await memberDetailsModel.findOne(
        { _id: req.member._id },
        { full_name: 1, phone_number: 1, email: 1, gender: 1 }
      );
      // console.log(getDetails, "getDetails")
    }

    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "successfully.",
      },
      data: {
        details: action === "get_info" ? getDetails : "",
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.log(error);
    responseData = {
      meta: {
        code: 200,
        success: false,
        message: "something went wrong!.",
      },
    };

    return res.status(responseData.meta.code).json(responseData);
  }
}

async function changePassword(req, res) {
  let responseData;
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const previousPassword = req.member.password;
    const isPasswordMatch = await bcrypt.compare(oldPassword, previousPassword);
    if (!isPasswordMatch) {
      responseData = {
        meta: {
          code: 200,
          success: false,
          message: "Old password is incorrect",
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }
    if (newPassword !== confirmNewPassword) {
      responseData = {
        meta: {
          code: 200,
          success: false,
          message: "New password and confirm password do not match",
        },
      };
      return res.status(responseData.meta.code).json(responseData);
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await memberDetailsModel.findByIdAndUpdate(
      req.member._id,
      { password: hashPassword },
      { new: true }
    );
    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "Password changed successfully",
      },
    };
    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.log(error);
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

async function getMemberDetails(req, res) {
  let responseData;
  try {
    const [memberDetails, notificationCount] = await Promise.all([
      memberDetailsModel.findOne(
        { _id: req.member._id },
        {
          full_name: 1,
          email: 1,
          gender: 1,
          mode: 1,
        }
      ),
      notificationModel.countDocuments({
        member_id: req.member._id,
        is_read: 0,
      }),
    ]);
    responseData = {
      meta: {
        code: 200,
        success: true,
        message: "SUCCESS",
      },
      data: {
        member_details: memberDetails,
        notification_count: notificationCount,
      },
    };
    return res.status(responseData.meta.code).json(responseData);
  } catch (error) {
    console.log(error);
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

module.exports = {
  register,
  login,
  verifyMember,
  editProfileDetails,
  changePassword,
  getMemberDetails,
};
