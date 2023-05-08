const mongoose = require("mongoose");
const RequestList = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    receiver_id: { type: mongoose.Schema.ObjectId, required: true },
    status: { type: Number, default: 1 },
    //status : 1:Sent,2:Accept,3:Reject
  },
  { timestamps: true }
);
module.exports = mongoose.model("RequestList", RequestList);
