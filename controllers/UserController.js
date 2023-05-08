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
  console.log(req.body);
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
        status: 1,
      };
      const updatedUser = await UserModel.updateOne(
        { _id: mongoose.Types.ObjectId(sender_id) },
        { $push: { "user_info.friends": newFriend } }
      );
      console.log(updatedUser);
      if (updatedUser)
        res.status(200).json({ message: "Request Send", up: updatedUser });
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
      status: status,
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
    {
      $match: {
        receiver_id: mongoose.Types.ObjectId(user_id),
        status: 1,
      },
    },
    { $project: { _id: 0, sender_id: 1, createdAt: 1 } },
    {
      $lookup: {
        from: "users",
        localField: "sender_id",
        foreignField: "_id",
        as: "users",
      },
    },
    {
      $project: {
        "users._id": 1,
        "users.personal_info.username": 1,
        "users.personal_info.firstname": 1,
        "users.personal_info.lastname": 1,
        "users.user_info.profilePicture": 1,
        timestamp: "$createdAt",
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
        _id: 1,
        "personal_info.firstname": 1,
        "personal_info.lastname": 1,
        "personal_info.username": 1,
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
  if (query) {
    const results = await UserModel.aggregate([
      {
        $match: {
          "personal_info.username": {
            $regex: query,
            $options: "i",
          },
          _id: {
            $ne: mongoose.Types.ObjectId(user_id),
          },
        },
      },
      {
        $lookup: {
          from: "requestlists",
          let: { user_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$sender_id", "$$user_id"] },
                    { $eq: ["$receiver_id", "$$user_id"] },
                  ],
                },
              },
            },
          ],
          as: "friend_status",
        },
      },
      {
        $project: {
          "personal_info.username": 1,
          "personal_info.firstname": 1,
          "personal_info.lastname": 1,
          "user_info.profilePicture": 1,
          friends: {
            $cond: {
              if: { $gt: [{ $size: "$friend_status" }, 0] },
              then: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$friend_status",
                      as: "friend",
                      cond: {
                        $or: [
                          {
                            $eq: [
                              "$$friend.sender_id",
                              mongoose.Types.ObjectId(user_id),
                            ],
                          },
                          {
                            $eq: [
                              "$$friend.receiver_id",
                              mongoose.Types.ObjectId(user_id),
                            ],
                          },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
              else: 0,
            },
          },
          send_by: {
            $cond: [
              {
                $in: [
                  mongoose.Types.ObjectId(user_id),
                  "$friend_status.sender_id",
                ],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $project: {
          "personal_info.username": 1,
          "personal_info.firstname": 1,
          "personal_info.lastname": 1,
          "user_info.profilePicture": 1,
          friends: {
            $cond: {
              if: { $ifNull: ["$friends", 0] },
              then: "$friends.status",
              else: 0,
            },
          },
          send_by: 1,
        },
      },
    ]);
    if (results.length > 0) res.status(200).json({ results: results });
    else res.status(200).json({ message: "no user found", status: 0 });
  } else {
    res.status(200).json({ results: [] });
  }
};

const Get_users_friends = async (req, res) => {
  const { user_id } = req.body;
  const ObjectId = mongoose.Types.ObjectId;
  const results = await UserModel.aggregate([
    {
      $match: {
        _id: ObjectId(user_id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user_info.friends.user_id",
        foreignField: "_id",
        as: "friend_info",
      },
    },
    {
      $unwind: "$friend_info", // flatten the array
    },
    {
      $match: { "friend_info.user_info.friends.status": "2" }, // filter based on friend's status
    },
    {
      $replaceRoot: { newRoot: "$friend_info" }, // replace the root with friend_info document
    },
    {
      $project: {
        _id: 1,
        "personal_info.username": 1,
        "personal_info.firstname": 1,
        "personal_info.lastname": 1,
        "user_info.profilePicture": 1,
      },
    },
  ]);
  if (results.length > 0) res.status(200).json({ results: results });
  else res.status(200).json({ message: "no user found", status: 0 });
};

module.exports = {
  Get_User_Detail,
  Send_Request,
  Get_RequestList,
  Get_All_Users,
  Search_User,
  Action_On_Request,
  Get_users_friends,
};
