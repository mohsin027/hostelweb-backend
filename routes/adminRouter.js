import express from 'express';
import { changeComplaintStatus, changeHostelListing, changeHostelStatus, changeUserStatus, dashboardData, getAllHostel, getAllUser, getBarChartData, getComplaints } from '../controllers/adminController.js';
const router=express.Router();


router.get('/hostel',getAllHostel)
router.get('/complaints',getComplaints)
router.get('/users',getAllUser)
router.get('/data',dashboardData)
router.get('/getBarChartData',getBarChartData)
router.patch('/hostel/ComplaintStatus',changeComplaintStatus )
router.patch('/hostel/registerStatus',changeHostelStatus )
router.patch('/hostel/listingStatus',changeHostelListing )
router.patch('/user/activeStatus',changeUserStatus )






export default router