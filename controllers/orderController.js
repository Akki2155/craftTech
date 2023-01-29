const Order= require("../models/orderModel.js")
const Product=require("../models/productModels.js");
const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncErrors= require("../middleware/catchAsyncErrors.js");

//create new order
exports.newOrder = catchAsyncErrors(async (req,res,next) => {

        const {shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body;

        const order= await Order.create({
                shippingInfo, 
                orderItems, 
                paymentInfo, 
                itemsPrice, 
                taxPrice, 
                shippingPrice, 
                totalPrice,
                paidAt: Date.now(),
                user:req.user._id
        });

        res.status(201).json({
                success:true,
                order,
        });
});


//get Single order
exports.getOrderDetails = catchAsyncErrors( async (req, res, next) =>{


        const order= await Order.findById(req.params.id).populate('user',"name email");

       
        if(!order){
                return  next( new ErrorHandler("Order Not found with the given ID", 404));
        }

        res.status(200).json({
                success:true,
                order,
        });
});

//get orders of  logged in user 

exports.getMyOrderDetails = catchAsyncErrors( async (req, res, next) =>{

        const orders= await Order.find({user: req.user._id});


        res.status(200).json({
                success:true,
                orders,
        });
});

// get all orders --admin
exports.getAllOrderDetails = catchAsyncErrors( async (req, res, next) =>{

        const orders= await Order.find();

        let totalAmount=0;

        orders.forEach(async (order)=>{
            totalAmount +=order.paymentInfo.totalPrice;
        })

        
        res.status(200).json({
                success:true,
                totalAmount,
                orders,
        });
});

//update order status --admin

exports.updateOrderStatus = catchAsyncErrors( async( req, res, next)=>{

        const order= await Order.findById(req.params.id);
        
        if(!order)
        {
                return  next(  new ErrorHandler("Order Not Found with the given Id", 404)); 
        }

        if(order.orderStatus==="Delivered")
        {
                return  next( new ErrorHandler("Order Already Delivered", 404)); 
        }

        order.orderItems.forEach(async(order)=>{
    
                await updateStock(order.product, order.quantity);
        });

       order.orderStatus=req.body.status;
       if(req.body.status==="Delivered")
       {
        order.deliveredAt= Date.now();
       }

       await order.save({validateBeforeSave:false});
       res.status(200).json({
        success:true,
       });
});

async function updateStock(id,quantity){

        const product= await Product.findById(id);

        product.stock -= quantity;
        await product.save({validateBeforeSave:false});
}

//delete order --admin

exports.deleteOrder = catchAsyncErrors( async (req, res, next) =>{

        const order= await Order.findById(req.params.id);

        if(!order)
        {
                return  next(  new ErrorHandler("Order Not Found with the given Id", 404)); 
        }

        await order.remove();

        res.status(200).json({
                success:true,
        });
});
