const express = require("express");
const {
  registerUser,
  LoginUser,
  SendMail,
  Check_UserName,
} = require("../controllers/AuthController");
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", LoginUser);
router.post("/sendotp", SendMail);
router.post("/checkusername", Check_UserName);
module.exports = router;
