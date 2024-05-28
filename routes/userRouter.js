import express from 'express';
import { addComplaint, bookRoom, cancelBooking, editUserProfile, editUserProfileImage, getAllHostels, getBookings, getComplaints, getHostel, getRoomsByHostel } from '../controllers/userController.js';
import { paymentOrder, verifyPayment } from '../controllers/paymentController.js';
const router=express.Router();


// router.post('/addHostel',addHostel)
router.get('/hostel',getHostel)
router.get('/getAllHostels',getAllHostels)
router.get('/bookings/',getBookings)
router.get('/getComplaints/',getComplaints)
router.get('/booking/cancel/:bookingId',cancelBooking)
router.post('/bookRoom',bookRoom)
router.get('/rooms/:hostelId',getRoomsByHostel)
router.patch('/editUserProfile',editUserProfile)
router.patch('/editUserProfileImage',editUserProfileImage)
router.post("/payment", paymentOrder)
router.post("/payment/verify", verifyPayment)
router.post('/addComplaint',addComplaint)







export default router