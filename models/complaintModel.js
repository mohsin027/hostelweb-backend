import mongoose from 'mongoose'


const complaintSchema = new mongoose.Schema(
    {
        hostelId: {
            type:  mongoose.Schema.Types.ObjectId,
            ref: "hostel",
            // required: true,
        },
        complaintType: {
            type: String,
            enum: ["Maintenance", "Security", "Cleanliness", "Others"],
            // required: true,
        },
        complaintDescription: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["New", "InProgress", "Resolved"],
            default: "New",
        },
        adminResponse: {
            type: String,
            default: "not Updated",
        },
        hostelResponse: {
            type: String,
            default: "not Updated",
        },
        userId: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    },
    { timestamps: true }
);

const ComplaintModel = mongoose.model('complaint', complaintSchema);

export default ComplaintModel;
