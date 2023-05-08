const express = require("express");
const {
  Get_User_Detail,
  Send_Request,
  Get_RequestList,
  Get_All_Users,
  Search_User,
  Action_On_Request,
  Get_users_friends,
} = require("../controllers/UserController");
const router = express.Router();
router.post("/profile", Get_User_Detail);
router.post("/sendrequest", Send_Request);
router.post("/getreqlist", Get_RequestList);
router.get("/getuserlist", Get_All_Users);
router.post("/finduser", Search_User);
router.post("/actionOnFriendRequest", Action_On_Request);
router.post("/getuserfriends", Get_users_friends);
module.exports = router;
