const UserModel = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
function generateOTP(len) {
  // Declare a digits variable
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < len; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
//Nodemailer Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "harshkumar140903@gmail.com",
    pass: "shqyevwyulfodjnz",
  },
});
//CheckUsername
const Check_UserName = async (req, res) => {
  const { username } = req.body;
  const result = await UserModel.findOne({
    "personal_info.username": username,
  });
  if (result) {
    res.status(200).json({ status: 0, message: "Username Already Taken" });
  } else {
    res.status(200).json({ status: 1 });
  }
};

// Register User
const registerUser = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.user_info.password, salt);
  req.body.user_info.password = hashedPass;
  const User = UserModel(req.body);
  User.save((err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.status(200).json({ result: result, status: 1 });
    }
  });
};
const SendMail = async (req, res) => {
  const { text, status } = req.body;
  let user;
  // send mail with defined transport object
  const otp = generateOTP(6);
  const mailOptions = await transporter.sendMail({
    from: "harshkumar140903@gmail.com", // sender address
    to: text, // list of receivers
    subject: "Verify", // Subject line
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
        <img src="https://i.stack.imgur.com/tkfDX.png" alt="Lamp" width="70" height="70">
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you for choosing  Facebook. Use the following OTP to complete your Sign Up procedures.</p>
        <h2 style="background-image: linear-gradient(91.62deg, #384CFF 0%, #00A3FF 100%);margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />Facebook</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Facebook Inc</p>
          <p>South City,Uttar Pradesh</p>
          <p>Lucknow</p>
        </div>
      </div>
    </div>`,
  });
  if (status == 0) {
    user = await UserModel.findOne({ "personal_info.username": text });
  } else {
    user = await UserModel.findOne({ "personal_info.mobile": text });
  }
  if (user == null && status == 0) {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.json({ message: "Error", error: error, status: 0 });
      } else {
        res.status(200).json({
          message: "Email sent: " + info.response,
          status: 1,
          otp: otp,
        });
      }
    });
  } else if (!user && status != 0) {
    // Twillo Needed
  } else {
    res.status(200).json({ message: "User Already Exist" });
  }
};

// Get User Details
const LoginUser = async (req, res) => {
  const { logincredentail, password, status } = req.body;
  let user;
  if (status == 0) {
    user = await UserModel.findOne({
      "personal_info.email": logincredentail,
    });
  } else {
    user = await UserModel.findOne({
      "personal_info.mobile": logincredentail,
    });
  }
  if (user) {
    const validity = await bcrypt.compare(password, user.user_info.password);
    if (validity) {
      res
        .status(200)
        .json({ status: 1, message: "Success", user_id: user._id });
    } else {
      res.status(200).json({ status: 0, message: "Invalid Password" });
    }
  } else {
    res.status(200).json({ status: 0, message: "Invalid Credentials" });
  }
};
module.exports = {
  registerUser,
  LoginUser,
  SendMail,
  Check_UserName,
};
