import mongoose from "mongoose";

const roomBookingSchema=mongoose.Schema({
checkIn:{
  type:Date,
  default:new Date()
},
expiry:{
  type:Date,
  required:true
},
hostelId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'hostel',
},
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'user',
},
roomId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'room',
},
amount: {
  type:Number,
  required:true,
},
personCount: {
  type:Number,
  required:true,
  default:1
},
paymentDetails:{
  type:Object,
},
status: {
  type:String,
  default:'active'
}
},
{ timestamps: true }
)

const roomBookingModel=mongoose.model('roomBooking',roomBookingSchema)
export default roomBookingModel;