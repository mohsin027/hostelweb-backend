import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema(
  {
    hostelName: {
      type: String,
      required: true,
    },
    // lat: {
    //   type: Number,
    //   required: true
    // },
    // lng: {
    //   type: Number,
    //   required: true
    // },
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'room',
      }
    ],
    isApproved: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    rejectedReason: {
      type: String,
      default: "none"
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
    hostelType: {
      type: String,
      required: true
    },
    admissionFees: {
      type: Number,
      required: true
    },
    hostelImage: {
        type: Object,
        required:true
    },
    location: {
      type: String,
      required: true
    },
    roomShares: {
      type: Array,
    },
    hostelReviews: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reviews',
    },
    adminData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelAdmin',
    }
  },
  { timestamps: true }
);

const HostelModel = mongoose.model('hostel', hostelSchema);

export default HostelModel;