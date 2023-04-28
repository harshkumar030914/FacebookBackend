const mongoose = require("mongoose");
const RequestList = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    receiver_id: { type: mongoose.Schema.ObjectId, required: true },
    status: { type: Number, default: 0 },
    //status : 0:Sent,1:Accept,2LReject
  },
  { timestamps: true }
);
module.exports = mongoose.model("RequestList", RequestList);
