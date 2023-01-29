const express=require("express");
const router= express.Router();
const { registerUser, loginUser, userLogOut, forgotPassword, resetPassword, 
        getUserDetails, updatePassword, updateProfile, getUser , getUsers, deleteUser, updateUserRole } = require("../controllers/userController.js");
const { isAuthenticated, authoriseRoles } = require("../middleware/auth");

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/me").get(isAuthenticated,getUserDetails);

router.route("/me/update").put(isAuthenticated,updateProfile);

router.route("/password/update").put(isAuthenticated, updatePassword);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(userLogOut);

router.route("/admin/users").get(isAuthenticated, authoriseRoles("admin"), getUsers);

router.route("/admin/user/:id").get(isAuthenticated, authoriseRoles("admin"), getUser);

router.route("/admin/user/remove/:id").get(isAuthenticated, authoriseRoles("admin"), deleteUser);


router.route("/admin/user/updateRole/:id").put(isAuthenticated, authoriseRoles("admin"), updateUserRole);


module.exports= router;