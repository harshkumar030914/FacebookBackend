const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    //Personal Information
    personal_info: {
      username: {
        type: String,
        required: true,
      },
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      birthdate: {
        type: Date,
        default: null,
      },
      gender: {
        type: Number,
        default: 0, //0 Male /1 Female /2:Others
      },
      mobile: {
        type: Number,
        default: 0,
        maxLength: 10,
      },
      email: {
        type: String,
        default: "",
      },
      relationship: {
        type: String,
        default: "", // Default value for relationship field
      },
      country: {
        type: String,
      },
    },
    //Info User In App
    user_info: {
      password: {
        type: String,
        required: true,
      },
      profilePicture: {
        type: String,
        default: "", // Default value for profilePicture field
      },
      coverPicture: {
        type: String,
        default: "", // Default value for coverPicture field
      },
      about: {
        type: String,
        default: "", // Default value for about field
      },
      friends: {
        type: [
          {
            user_id: mongoose.Schema.ObjectId,
            status: String,
          },
        ],
        default: [], // Default value for friends field
      },
    },
    //Qualification
    user_education: {
      worksAt: {
        type: String,
        default: "", // Default value for worksAt field
      },
      studyAt: {
        type: String,
        default: "", // Default value for studyAt field
      },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Users", UserSchema);
