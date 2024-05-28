import jwt from "jsonwebtoken";
import otpHelper from "../helpers/otpHelper.js";
import bcrypt from "bcrypt";
import HostelAdminModel from "../models/hostelAdminModel.js";

var salt = bcrypt.genSaltSync(10);

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET_KEY, { expiresIn: "3d" });
};

export const home = async (req, res) => {
  try {
    const hostel = await HostelAdminModel.find();
    res.status(200).json({ message: "hostel home" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
};

export const hostelRegister = async function (req, res) {
  try {
    const { email } = req.body;
    const hostelAdmin = await HostelAdminModel.findOne({ email });
    if (hostelAdmin) {
      return res.json({ err: true, message: "hostelAdmin Already Exist" });
    }
    let otp = Math.ceil(Math.random() * 1000000);

    let otpSent = await otpHelper(email, otp);
    console.log(otp, "otpSent: ");
    const token = jwt.sign(
      {
        otp: otp,
      },
      process.env.JWT_SECRET_KEY
    );
    return res
      .cookie("tempHostelToken", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 10,
        sameSite: "none",
      })
      .json({ err: false, tempHostelToken: token });
  } catch (err) {
    console.log(err);
    res.json({ err: true, error: err, message: "something went wrong" });
  }
};

export async function hostelRegisterVerify(req, res) {
  try {
    const { fullName, email, password, contactNumber, otp } = req.body;
    const hostelAdmin = await HostelAdminModel.findOne({ email });
    if (hostelAdmin) {
      return res.json({ err: true, message: "hostelAdmin Already Exist" });
    }
    // const hostel = JSON.parse(localStorage.getItem("hostel"));
    const tempHostelToken = req.cookies.tempHostelToken;
    if (!tempHostelToken) {
      return res.json({ err: true, message: "OTP Session Timed Out" });
    }

    const verifiedTempToken = jwt.verify(
      tempHostelToken,
      process.env.JWT_SECRET_KEY
    );

    if (otp != verifiedTempToken.otp) {
      return res.json({ err: true, message: "Invalid OTP" });
    }

    const hashPassword = bcrypt.hashSync(password, salt);

    const newHostelAdmin = new HostelAdminModel({
      fullName,
      email,
      password: hashPassword,
      contactNumber,
    });
    await newHostelAdmin.save();

    const token = jwt.sign(
      {
        id: newHostelAdmin._id,
      },
      process.env.JWT_SECRET_KEY
    );
    return res
      .cookie("hostelToken", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "none",
      })
      .json({ err: false, token });
  } catch (err) {
    console.log(err);
    res.json({ error: err, err: true, message: "something went wrong" });
  }
}

export async function hostelLogin(req, res) {
  try {
    const { email, password } = req.body;
    const hostel = await HostelAdminModel.findOne({ email });
    if (!hostel)
      return res.json({ err: true, message: "No hostel admin found" });
    if (hostel.block)
      return res.json({ err: true, message: "You are blocked" });
    if (!hostel.password) {
      return res.json({ err: true, message: "Please login" });
    }
    const hostelValid = bcrypt.compareSync(password, hostel.password);
    if (!hostelValid) return res.json({ err: true, message: "wrong Password" });
    const hostelToken = jwt.sign(
      {
        id: hostel._id,
      },
      process.env.JWT_SECRET_KEY
    );
    return res
      .cookie("hostelToken", hostelToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 30,
        sameSite: "none",
      })
      .json({ err: false, hostel, hostelToken });
  } catch (err) {
    console.log(err);
    res.json({ message: "server error", err: true, error: err });
  }
}

export const logoutHostel = async (req, res) => {
  res
    .cookie("hostelToken", null, {
      httpOnly: true,
      secure: true,
      maxAge: 0,
      sameSite: "none",
    })
    .json({ err: false });
};

export const checkHostelLoggedIn = async (req, res) => {
  try {
    const hostelToken = req.cookies.hostelToken;
    if (!hostelToken)
      return res.json({ loggedIn: false, error: true, message: "no token" });
    const verifiedJWT = jwt.verify(hostelToken, process.env.JWT_SECRET_KEY);
    const hostel = await HostelAdminModel.findById(verifiedJWT.id, {
      password: 0,
    });
    if (!hostel) {
      return res.json({ loggedIn: false });
    }
    if (hostel.block) {
      return res.json({ loggedIn: false });
    }
    return res.json({ hostel, loggedIn: true, hostelToken });
  } catch (err) {
    console.log(err);
    res.json({ loggedIn: false, error: err });
  }
};
