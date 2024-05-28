import mongoose from "mongoose";

const HostelAdminSchema = new mongoose.Schema(
  {
    hosteldata: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: Number,
      required: true,
    },
    adminImage: {
      type: String,
    },
    walletTotal: {
      type: Number,
      default: 0,
    },
    walletDetails: {
      type: String,
    },
    status: {
      type: String,
      default: "Guest",
    },
    qualification: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    Address: {
      type: String,
    },
  },
  { timestamps: true }
);

const HostelAdminModel = mongoose.model("HostelAdmin", HostelAdminSchema);

export default HostelAdminModel;
