const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncErrors= require("../middleware/catchAsyncErrors.js");
const User= require("../models/userModel.js");
const sendToken = require("../utils/jwtToken.js");
const sendEmail = require("../utils/sendEmail");
const crypto= require("crypto");


// Register a user 

exports.registerUser = catchAsyncErrors( async (req, res, next) =>{

    const {name,email, password} =req.body;
    const user= await User.create({
        name, email, password, 
        avatar:{
            public_id:"this is a sample",
            url:"profilePicUrl"
        }
    });
   
    sendToken(user, 201, res);
});

//   User Login

exports.loginUser= catchAsyncErrors(async (req,res, next) =>{

    const  { email, password}= req.body;

    //Checking if user has given password and email both 

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email and Password ", 400))
    }

    const user=await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password email"),401);
    }

    const isPasswordMatched= await  user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password password"),401);
    }

    sendToken(user, 200, res);

});

//lOg out User

exports.userLogOut = catchAsyncErrors( async (req,res,next)=>{


    res.cookie("token", null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
});

//Forgot Password function

exports.forgotPassword = catchAsyncErrors( async (req, res, next) =>{
      
    const user= await User.findOne({email: req.body.email});

    if(!user){
        return  next(new ErrorHandler("User Not Found", 404));
    }

    //Get reset password token

    const resetToken = user.getResetPasswordToken();

    await user.save({
        validatorBeforSave:false
    });

    const resetPasswordUrl= `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message= `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n. If you have not requested this email then,please ignore it !!`;

    try{

        await sendEmail({
           email:user.email,
           subject:`CraftTech password Recovery`,
           message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        })

    } catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({
            validatorBeforSave:false
        });

        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset Password
exports.resetPassword = catchAsyncErrors( async (req, res, next) =>{

    //creating token hash
    const resetPasswordToken= crypto.createHash("sha256").update(req.params.token).digest("hex");
    console.log(resetPasswordToken);

    // searching user using hash token

    const user= await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()},
    });

    if(!user)
    {
        return next(new ErrorHandler("Reset Password is invalid or has been expired !!", 400));
    }

    if(req.body.password !== req.body.confirmPassword)
    {
        return next(new ErrorHandler("Password Doesn't Match", 400));
    }

    user.password=req.body.password;
    user.resetPasswordExpire= undefined;
    user.resetPasswordToken = undefined;


    await user.save();
    sendToken(user, 200, res);
});


//Get User Details

exports.getUserDetails = catchAsyncErrors( async (req, res, next) =>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    });
});

//update user password 

exports.updatePassword = catchAsyncErrors( async (req, res, next) =>{

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched= await  user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched) 
    {
        return next(new ErrorHandler("Old Password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword )
    {
        return next(new ErrorHandler("Password Does not Match",400));
    }

    user.password=req.body.newPassword;
    await user.save()

    sendToken(user,200,res);
});

//update user profile

exports.updateProfile = catchAsyncErrors( async (req, res, next) =>{

    const newUserData= {
        name: req.body.name,
        email:req.body.email,
    }

    const user= await User.findByIdAndUpdate(req.user.id, newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify:true
    })

    //we will add cloudiary later

    res.status(200).json({
        success:true,
        user
    })
});


//get all users -- admin

exports.getUsers = catchAsyncErrors( async (req,res, next) =>{

    const users= await User.find();

    res.status(200).json({
        success:true,
        users
    })

});

  // get single user --admin

exports.getUser = catchAsyncErrors( async (req,res, next) =>{

    const user= await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`User Not Found With Given Id : ${req.params.id}`,404))
    }

    res.status(200).json({
        success:true,
        user
    })

});

//delete user

exports.deleteUser= catchAsyncErrors( async (req,res,next) =>{

    const user= await User.findByIdAndDelete(req.params.id);

    if(!user){
        return next(new ErrorHandler("User Not Found",400))
    }

    //we will remove cloudiary later

    res.status(200).json({
        success:true,
        message:`User ${req.params.id} deleted Successfully`
    })

});

// update user role

exports.updateUserRole = catchAsyncErrors( async (req, res, next) =>{

    const newUserData= {
        name: req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const user= await User.findByIdAndUpdate(req.params.id, newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify:true
    })

    if(!user){
        return next(new ErrorHandler("User Not Found",400))
    }

    //we will add cloudiary later

    res.status(200).json({
        success:true,
        user
    })
});