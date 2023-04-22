const express = require("express");
const { Get_User } = require("../controllers/UserController");
const router = express.Router();
router.post("/profile", Get_User);
module.exports = router;
