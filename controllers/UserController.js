const UserModel = require("../models/UserSchema");
//Get user Details
const Get_User = async (req, res) => {
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
module.exports = {
  Get_User,
};
