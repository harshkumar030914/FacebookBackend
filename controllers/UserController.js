const UserModel = require("../models/UserSchema");
const RequestModel = require("../models/FriendRequestSchema");
const mongoose = require("mongoose");
//Get user Details
const Get_User_Detail = async (req, res) => {
  const { user_id } = req.body;
  try {
    const user = await UserModel.findById({ _id: user_id });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const Forgot_Password = async (req, res) => {
  const { new_password, status } = req.body;
  try {
    const user = await UserModel.findOneAndUpdate(
      { text },
      { password: new_password }
    );
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Send Request
const Send_Request = async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  const request = new RequestModel({
    sender_id: sender_id,
    receiver_id: receiver_id,
  });
  request.save(async (err, result) => {
    if (err) {
      res.status(500).json({ message: "Server Error" });
    } else {
      const newFriend = {
        user_id: receiver_id,
        status: 0,
      };
      const updatedUser = await UserModel.updateOne(
        { _id: mongoose.Types.ObjectId(sender_id) },
        { $push: { "user_info.friends": newFriend } }
      );
      if (updatedUser) res.status(200).json({ message: "Request Send" });
      else res.status(200).json({ message: "Some error Occurred" });
    }
  });
};
//Action On Request
const Action_On_Request = async (req, res) => {
  const { sender_id, user_id, status } = req.body;
  const result = await RequestModel.findOneAndUpdate(
    {
      sender_id: sender_id,
      receiver_id: user_id,
    },
    {
      $set: { status: status },
    },
    { new: true }
  );
  if (result) {
    const newFriend = {
      user_id: sender_id,
      status: 1,
    };
    const updatedUser = await UserModel.updateOne(
      { _id: mongoose.Types.ObjectId(user_id) },
      { $push: { "user_info.friends": newFriend } }
    );
    if (updatedUser) {
      const updateSenderStatus = await UserModel.updateOne(
        {
          _id: mongoose.Types.ObjectId(sender_id),
          "user_info.friends.user_id": user_id,
        },
        { $set: { "user_info.friends.$.status": status } }
      );
      if (updateSenderStatus) {
        res.status(200).json({ message: "ok", status: 1 });
      } else {
        res.status(200).json({ message: "Error", status: 0 });
      }
    } else res.status(500);
  } else {
    res.status(500);
  }
};
//Get the requestlist of user
const Get_RequestList = async (req, res) => {
  const { user_id } = req.body;
  const result = await RequestModel.aggregate([
    { $match: { receiver_id: mongoose.Types.ObjectId(user_id) } },
    { $project: { _id: 0, sender_id: 1, createdAt: 1 } },
    {
      $lookup: {
        from: "users",
        localField: "sender_id",
        foreignField: "_id",
        as: "users",
      },
    },
  ]);
  if (result.length > 0) res.json({ result: result });
  else res.json({ result: result });
};
//All users
const Get_All_Users = async (req, res) => {
  try {
    const result = await UserModel.find(
      {},
      {
        "personal_info.firstname": 1,
        "personal_info.lastname": 1,
        _id: 1,
        "user_info.profilePicture": 1,
      }
    );

    if (result.length > 0) res.status(200).json({ result: result });
    else res.status(200).json({ message: "No user Found" });
  } catch (error) {
    res.status(500).json({ message: "Some Error Occurred" });
  }
};
//Search User
const Search_User = async (req, res) => {
  const { query, user_id } = req.body;
  if (query.length > 0) {
    const results = await UserModel.aggregate([
      {
        $match: {
          "personal_info.username": { $regex: query, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          "user._id": 1,
          "user.personal_info.username": 1,
          "user.user_info.profilePicture": 1,
          friend: {
            $cond: [
              { $in: [user_id, "$user.user_info.friends.user_id"] },
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$user.user_info.friends",
                      as: "friend",
                      cond: { $eq: ["$$friend.user_id", user_id] },
                    },
                  },
                  0,
                ],
              },
              -1,
            ],
          },
        },
      },
    ]);
    if (results.length > 0) res.status(200).json({ results: results });
    else res.status(200).json({ message: "no user found", status: 0 });
  } else {
    res.status(200).json({ results: [] });
  }
};

module.exports = {
  Get_User_Detail,
  Send_Request,
  Get_RequestList,
  Get_All_Users,
  Search_User,
  Action_On_Request,
};
