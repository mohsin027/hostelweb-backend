import mongoose from 'mongoose';

const hostelRoomSchema = new mongoose.Schema(
    {
        room_no: {
            type: String,
        },
        capacity:{
            type:Number,
        },
        occupants: {
            type: Number,
            default:0
        },
        hostelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hostel',
          },
        status: {
            type: String,
        },
        room_image: {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
        },
        room_rent: {
            type: Number,
        },
        block: {
            type: Boolean,
            default: false
        },
        title:{
            type:String,
        },
        description:{
            type:String,
        }

    },
    { timestamps: true }
);

const RoomModel = mongoose.model('room', hostelRoomSchema);

export default RoomModel;
