const Product=require("../models/productModels.js");
const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncErrors= require("../middleware/catchAsyncErrors.js");
const ApiFeatures=require("../utils/apiFeatures.js");



//create Product --admin
exports.createProduct = catchAsyncErrors( async (req, res, next) =>{

    req.body.user= req.user.id;

    const product= await Product.create(req.body);
    res.status(201).json({
     success:true,
     product
    })

});



//Update Product   --Admin
exports.updateProduct = catchAsyncErrors(async (req, res) =>{

    let product= await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product Not Available", 404));
        }

    product= await Product.findByIdAndUpdate(req.params.id, req.body,
        {
        new:true, runValidators:true, useFindAndModify:false
         })

   res.status(200).json({
       success:true,
       product
   })

});



//Delete Product -- Admin
exports.deleteProduct= catchAsyncErrors(async (req, res, next) =>{

    const product= await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product Not Available", 404));
        }

    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })

});



//Get all product 
exports.getAllProducts =  catchAsyncErrors(async (req, res) =>{
       
    const resultPerPage=5;
    const productCount= await Product.countDocuments()

    const apiFeatures=new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    const Products= await apiFeatures.query;
     res.status(200).json({
        success:true, 
        Products,
        productCount
     })
});




//Get Single product Details
exports.getProductDetails = catchAsyncErrors(async (req, res,next) =>{

    const product= await Product.findById(req.params.id);
    
    if(!product)
    {
        return next(new ErrorHandler("Product Not Available", 404));
    }

    res.status(200).json({
        success: true,
        product
    })
 });




//create new / update product review 
exports.createProductReview = catchAsyncErrors( async(req,res,next) =>{


     
     const {rating, comment, productId} = req.body;  
    const review={
        user:req.user.id,
        name:req.user.name,
        rating:Number(rating),
        comment,
      }
    
      const product= await Product.findById(productId);

     
      const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
      );

      if(isReviewed)
      {
            product.reviews.forEach(rev => {
                console.log(rev.user.toString()===req.user._id.toString())
                if( rev.user.toString()===req.user._id.toString())
                {
                
                rev.rating=rating,
                rev.comment=comment
                }
            });
      }

      else
      {
        
        product.reviews.push(review);
        product.numOfReviews= product.reviews.length;
      }


      let avg=0;
       product.reviews.forEach(rev => {
        avg +=rev.rating
      });

      product.ratings = avg/product.reviews.length;

      await product.save({ validateBeforeSave:false });

      res.status(200).json({
        success:true
      })
});



//get all reviews of a single product
exports.getProductReviews= catchAsyncErrors( async( req, res, next ) =>{

   const product= await Product.findById(req.query.productId);

   if(!product)
   {
      return next(new ErrorHandler("Product Not Found", 404))
    }

    res.status(200).json({
        success:true,
        reviews: product.reviews
    })
});



// Delete review 
exports.deleteReview= catchAsyncErrors( async( req, res, next ) =>{

    const product= await Product.findById(req.query.productId);
 
    if(!product)
    {
       return next(new ErrorHandler("Product Not Found", 404))
     }
 
      const reviews= product.reviews.filter((rev) => rev._id.toString() !== req.query.reviewId.toString());

      let avg=0;
      const ratings=0;
      reviews.forEach(rev => {
       avg +=rev.rating
     });

     if(avg !== 0)
     {
        ratings = avg/reviews.length;
     }
    

    const numOfReviews= reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {reviews,ratings,numOfReviews},{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

     res.status(200).json({
         success:true,
     })
 });