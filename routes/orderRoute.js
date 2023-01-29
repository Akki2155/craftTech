const express=require("express");
const { newOrder, getMyOrderDetails, getOrderDetails, getAllOrderDetails, updateOrderStatus, deleteOrder } = require("../controllers/orderController.js");
const { isAuthenticated, authoriseRoles } = require("../middleware/auth");

const router= express.Router();


router.route("/order/new").post(isAuthenticated, newOrder);

router.route("/order/me").get(isAuthenticated, getMyOrderDetails);

router.route("/order/:id").get(isAuthenticated, getOrderDetails);

router.route("/admin/orders").get(isAuthenticated, authoriseRoles("admin"), getAllOrderDetails);

router.route("/admin/order/:id").put(isAuthenticated, authoriseRoles("admin"), updateOrderStatus).delete(isAuthenticated, authoriseRoles("admin"), deleteOrder);




module.exports=router;