const errorHandler= require("../utils/errorHandler");

module.exports= (err, req, res, next) =>{

err.statusCode=  err.statusCode || 500;
err.message= err.message || "Internal Server Error"

// Wrong MongoDB Id error

if(err.name === "CastError"){
    const message= `Resource Not Found. Invalid : ${err.path}`;
    err= new errorHandler(message, 400);
}

// Mongoose duplicate key error
if(err.code=== 11000)
{
    const message= `Duplicate ${Object.keys(err.keyValue)} Entered `;
    err= new errorHandler(message, 400);
}

// Wrong Jwt error

if(err.name === "JsonWebTokenError"){
    const message= `Json Web Token is Invalid. Try Again`;
    err= new errorHandler(message, 400);
}

//Jwt exprire error
if(err.name === "TokenExpiredError"){
    const message= `Json Web Token is Invalid. Try Again`;
    err= new errorHandler(message, 400);
}


res.status(err.statusCode).json({
    success: false, 
    message: err.message,
});



};