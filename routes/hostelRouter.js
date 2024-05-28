import express from 'express';
import {  addHostel,  changeComplaintStatus,  changeHostelListing, getBookings, getComplaints, getRoomsByHostel, handleBlockStatus, hostelCheck, updateHostel } from '../controllers/hostelController.js';
import { addRooms } from '../controllers/roomController.js';
const router=express.Router();

router.post('/addHostel',addHostel)
router.get('/check',hostelCheck)
router.get('/booking',getBookings)
router.patch('/complaintStatus',changeComplaintStatus )
router.post('/addRooms',addRooms)
router.post('/blockStatus',handleBlockStatus)
router.get('/rooms/:hostelId',getRoomsByHostel)
router.patch('/updateHostel',updateHostel)
router.patch('/listingStatus',changeHostelListing )
router.get('/getComplaints/',getComplaints)








export default router