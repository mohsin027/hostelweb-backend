import Razorpay from 'razorpay'
import crypto from 'crypto'
import BookingModel from '../models/roomBookingModel.js';
import RoomModel from '../models/roomModel.js';
import UserModel from '../models/userModel.js';


let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function paymentOrder(req, res) {
    try {
        const {amount}=req.body;
        var options = {
            amount: amount * 100,  // amount in the smallest currency unit
            currency: "INR",
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log(err)
                res.json({ err: true, message: "server error" })
            } else {
                res.json({ err: false, order })
            }
        });
    } catch (error) {
        res.json({ err: true, message: "server error", error })
    }

}

export async function verifyPayment(req, res) {
    try {

        const {
            response,
            userId, hostelId,
            roomId, personCount,
            amount,
            checkIn
        } = req.body;

        const expiry = new Date(new Date(checkIn).setMonth(new Date(checkIn).getMonth()+1))

        let body = response.razorpay_order_id + "|" + response.razorpay_payment_id;

        var expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === response.razorpay_signature){
            await RoomModel.findByIdAndUpdate(roomId, {$inc:{occupants:1}})
            const booking= await BookingModel.create({
                paymentDetails:response,
                userId, hostelId,
                roomId, personCount,
                amount,checkIn, expiry
            })
            await UserModel.findByIdAndUpdate(userId, {hostelData:booking})
            return res.json({
                err:false, booking
            })
        }else{
            return res.json({
                err:true, message:"payment verification failed"
            })
        }


    }catch(error){
        console.log(error)
        res.json({error, err:true, message:"something went wrong"})
    }

}