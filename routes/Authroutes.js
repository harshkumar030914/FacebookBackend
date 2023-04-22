const express = require("express");
const {
  registerUser,
  LoginUser,
  SendMail,
} = require("../controllers/AuthController");
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", LoginUser);
router.post("/sendotp", SendMail);
module.exports = router;
