import mongoose from "mongoose";
import HostelModel from "../models/hostelModel.js";
import UserModel from "../models/userModel.js";
import roomBookingModel from "../models/roomBookingModel.js";
import RoomModel from "../models/roomModel.js";
import Razorpay from 'razorpay'
import cloudinary from "../config/cloudinary.js";
import ComplaintModel from "../models/complaintModel.js";


let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const getAllHostels=  async (req, res) => {
  try {
    
    const hostelList = await HostelModel.find({isApproved: "Approved",isBlocked:false}).populate("rooms");
    res.status(201).json({success:true,hostelList});
  } catch (error) {
    console.error('Error getting hostel:', error);
    res.status(500).json({ error: 'Failed to get hostel' });
  }
}
export const getHostel = async (req, res) => {
  try {
    const { limit, skip } = req.query;
    const sharing = req.query.sharing ?? null
    const gender = req.query.gender ? req.query.gender : new RegExp("");
    const location = req.query.location ? new RegExp(req.query.location, 'i') : new RegExp("");
    const locations = await HostelModel.find({},{location:1, _id:0}).lean()

    let count;
    if(sharing){
      count = await HostelModel.find({isApproved: "Approved",isBlocked:false, hostelType:gender, location, roomShares:sharing}).count();
    }else{
      count = await HostelModel.find({isApproved: "Approved",isBlocked:false, hostelType:gender, location }).count();
  }
    let hostelList = [];
    if (limit && sharing) {
      hostelList = await HostelModel.find({isApproved: "Approved",isBlocked:false,  hostelType:gender, location, roomShares:sharing}).populate("rooms")
        .skip(skip ?? 0)
        .limit(limit)
        .sort({ _id: -1 });
    }
    else if (limit) {
      hostelList = await HostelModel.find({isApproved: "Approved",isBlocked:false,hostelType: gender, location}).populate("rooms")
        .skip(skip ?? 0)
        .limit(limit)
        .sort({ _id: -1 });
    }
     else {
      hostelList = await HostelModel.find({isApproved: "Approved",isBlocked:false, gender, location}).populate("rooms")
        .skip(skip ?? 0)
        .sort({ _id: -1 });
    }
    res.status(201).json({ hostelList, count, limit, skip, locations });
  } catch (error) {
    console.error("Error getting hostel:", error);
    res.status(500).json({ error: "Failed to fetch hostel" });
  }
};

export const bookRoom=  async (req, res) => {
  try {
    // const booking = await roomBookingModel({});
    res.status(201).json({success:true});
  } catch (error) {
    console.error('Error booking room:', error);
    res.status(500).json({ error: 'Failed to book room' });
  }
}
export const editUserProfile=  async (req, res) => {
  try {
    const {id, fullName, address,  contactNumber, gender} = req.body
    const editUser = await UserModel.findByIdAndUpdate(id, {
      $set:{
        fullName, address,  contactNumber, gender
      }
    })
    res.status(201).json({success:true,editUser, err:false});
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ err:true, error: 'Failed to update profile' });
  }
}
export const editUserProfileImage=  async (req, res) => {
  try {
    const {id} = req.body
    const image=await cloudinary.uploader.upload(req.body.image,{
      folder:'hostelweb'
    })
    const editUser = await UserModel.findByIdAndUpdate(id, {
      $set:{
        image:image
      }
    })
    res.status(201).json({success:true,editUser, err:false});
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ err:true, error: 'Failed to update profile' });
  }
}
export const getRoomsByHostel=  async (req, res) => {
  try {
    const {hostelId} = req.params;
    const hostel = await HostelModel.findOne({_id:hostelId}).populate('rooms').lean()
    res.status(201).json({success:true,hostel,err:false});
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ err:true, error: 'Failed to update profile' });
  }
}
export const getBookings=  async (req, res) => {
  try {
    const { userId,limit, skip } = req.query;
    // const booking = await roomBookingModel.find({userId}).populate('roomId hostelId')
//
const count = await roomBookingModel.find({userId}).count();
let bookings = [];
if (limit) {
  bookings = await roomBookingModel.find({userId}).populate('roomId hostelId')
    .skip(skip ?? 0)
    .limit(limit)
    .sort({ _id: -1 });
} else {
  bookings = await roomBookingModel.find({userId}).populate('roomId hostelId')
    .skip(skip ?? 0)
    .sort({ _id: -1 });
}
//

res.status(201).json({ bookings, count, limit, skip });
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ err:true, error: 'Failed to get profile' });
  }
}
export const cancelBooking=  async (req, res) => {
  try {
    const {bookingId} = req.params;
    const booking = await roomBookingModel.findById(bookingId).populate('hostelId')
    if(booking.status==="cancelled"){
      return res.json({err:true, message:"Booking already cancelled"});
    }
    const paymentId=booking.paymentDetails.razorpay_payment_id;
    const payment = await instance.payments.fetch(paymentId);

    if (payment.amount_refunded) {
      return res.json({err:true, message:"Payment has been refunded."})
    }

    await instance.payments.refund(paymentId,{
      "amount": booking.amount * 100 ,
      "speed": "normal",
      "notes": {
        "notes_key_1": "Thank you for using hostelWeb",
      }
    })

    booking.status="cancelled";
    await booking.save();
    await RoomModel.findByIdAndUpdate(booking.roomId,{$inc:{occupants:-1}})
    res.status(201).json({success:true ,err:false});
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ err:true, error: 'Failed to cancel booking' });
  }
}

export const addComplaint=async (req,res)=> {
 try {
  const complaint = await ComplaintModel.create(req.body)
  res.status(201).json({success:true ,err:false,complaint});
 } catch (error) {
  console.error('Error registering complaint:', error);
    res.status(500).json({ err:true, error: 'Failed to add complaint' });
 } 
}
export const getComplaints=async (req,res)=> {
 try {
  const {userId}=req.query
  const complaints = await ComplaintModel.find({userId}).populate('hostelId')
  res.status(201).json({success:true ,err:false,complaints});
 } catch (error) {
  console.error('Error registering complaint:', error);
    res.status(500).json({ err:true, error: 'Failed to fetch complaint' });
 } 
}