import ComplaintModel from "../models/complaintModel.js";
import HostelModel from "../models/hostelModel.js";
import roomBookingModel from "../models/roomBookingModel.js";
import RoomModel from "../models/roomModel.js";
import UserModel from "../models/userModel.js";
import cron from "node-cron";

cron.schedule("0 0 0 * * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const updated = await roomBookingModel.updateMany(
      {
        expiry: {
          $gte: today,
          $lt: tomorrow,
        },
        status: "active",
      },
      {
        $set: {
          status: "expired",
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
});

export const getAllHostel = async (req, res) => {
  try {
    const { limit, skip } = req.query;
    const count = await HostelModel.find().count();
    let hostelList = [];
    if (limit) {
      hostelList = await HostelModel.find()
        .skip(skip ?? 0)
        .limit(limit)
        .sort({ _id: -1 });
    } else {
      hostelList = await HostelModel.find()
        .skip(skip ?? 0)
        .sort({ _id: -1 });
    }
    res.status(201).json({ hostelList, count, limit, skip });
  } catch (error) {
    console.error("Error getting hostel:", error);
    res.status(500).json({ error: "Failed to fetch hostel" });
  }
};
export const getAllUser = async (req, res) => {
  try {
    const { limit, skip } = req.query;
    const count = await UserModel.find().count();
    let userList = [];
    if (limit) {
      userList = await UserModel.find()
        .skip(skip ?? 0)
        .limit(limit)
        .sort({ _id: -1 });
    } else {
      userList = await UserModel.find()
        .skip(skip ?? 0)
        .sort({ _id: -1 });
    }
    res.status(201).json({ userList, count, skip, limit });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
export const changeHostelStatus = async (req, res) => {
  try {
    const { stat, id } = req.body;
    if (!stat)
      return res
        .status(201)
        .json({ err: true, message: "status validation failed" });
    if (!id)
      return res
        .status(201)
        .json({ err: true, message: "id validation failed" });
    const hostel = await HostelModel.findByIdAndUpdate(id, {
      $set: { isApproved: stat },
    });
    res.status(201).json({ err: false, hostel });
  } catch (error) {
    console.error("Error creating hostel:", error);
    res.status(500).json({ err: true, error: "Failed to fetch hostel" });
  }
};
export const changeHostelListing = async (req, res) => {
  try {
    const { listing, id } = req.body;
    if (!listing)
      return res
        .status(201)
        .json({ err: true, message: "status validation failed" });
    if (!id)
      return res
        .status(201)
        .json({ err: true, message: "id validation failed" });
    const hostel = await HostelModel.findByIdAndUpdate(id, {
      $set: { isBlocked: listing },
    });
    res.status(201).json({ err: false, hostel });
  } catch (error) {
    console.error("Error creating hostel:", error);
    res.status(500).json({ err: true, error: "Failed to fetch hostel" });
  }
};

export const changeUserStatus = async (req, res) => {
  try {
    const { stat, id } = req.body;
    if (!stat)
      return res
        .status(201)
        .json({ err: true, message: "status validation failed" });
    if (!id)
      return res
        .status(201)
        .json({ err: true, message: "id validation failed" });
    const user = await UserModel.findByIdAndUpdate(id, {
      $set: { isBlocked: stat },
    });
    res.status(201).json({ err: false, user });
  } catch (error) {
    console.error("Error creating hostel:", error);
    res.status(500).json({ err: true, error: "Failed to fetch user" });
  }
};

export const dashboardData = async (req, res) => {
  try {
    const hostelCount = await HostelModel.find().count();
    const userCount = await UserModel.find().count();
    const bookings = await roomBookingModel.find();
    const today = new Date();
    //

    const activeBookings = bookings.filter((booking) => {
      const checkInDate = booking.checkIn;
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 30);

      return today >= checkInDate && today <= checkOutDate;
    });
    const activeBookingsCount = activeBookings.length;

    const bookingCount = bookings.length;
    res
      .status(201)
      .json({
        err: false,
        message: "success",
        hostelCount,
        userCount,
        bookingCount,
        activeBookingsCount,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, error: "Failed to fetch data" });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const complaints = await ComplaintModel.find()
      .sort({ createdAt: -1 })
      .populate("hostelId userId");
    res.status(201).json({ success: true, err: false, complaints });
  } catch (error) {
    console.error("Error registering complaint:", error);
    res.status(500).json({ err: true, error: "Failed to fetch complaint" });
  }
};

export const changeComplaintStatus = async (req, res) => {
  try {
    const { stat, id } = req.body;
    if (!stat)
      return res
        .status(201)
        .json({ err: true, message: "status validation failed" });
    if (!id)
      return res
        .status(201)
        .json({ err: true, message: "id validation failed" });
    const complaint = await ComplaintModel.findByIdAndUpdate(id, {
      $set: { status: stat },
    });
    res.status(201).json({ error: false, complaint });
  } catch (error) {
    console.error("Error creating hostel:", error);
    res.status(500).json({ err: true, error: "Failed to fetch hostel" });
  }
};

export const getBarChartData = async (req, res) => {
  try {
    const hostels = await HostelModel.find().populate("rooms");
    const users = await UserModel.find();
    const bookings = await roomBookingModel.find();
    const roomCapacity = await RoomModel.aggregate([
      {
        $group: {
          _id: null, // Group all documents into a single group
          totalCapacity: { $sum: "$capacity" }, // Sum the capacity of all rooms
        },
      },
    ]);
    const roomOccupancy = await RoomModel.aggregate([
      {
        $group: {
          _id: null, // Group all documents into a single group
          totalOccupants: { $sum: "$occupants" }, // Sum the capacity of all rooms
        },
      },
    ]);
    //

    res
      .status(201)
      .json({
        err: false,
        message: "success",
        hostels,
        users,
        bookings,
        roomCapacity,
        roomOccupancy,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, error: "Failed to fetch data" });
  }
};
