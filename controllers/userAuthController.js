import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import otpHelper from "../helpers/otpHelper.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import axios from "axios";

var salt = bcrypt.genSaltSync(10);

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY);
};

export const home = async (req, res) => {
  try {
    const user = await UserModel.find().lean();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
};

export const userReg = async (req, res) => {
  const { fullName, email, password, gender, contactNumber } = req.body;

  try {
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.json({ err: true, message: "user already found" });
    }
    let otp = Math.ceil(Math.random() * 1000000);

    let otpSent = await otpHelper(email, otp);
    // user = await UserModel.create({fullName,email, password,gender,contactNumber})
    const token = jwt.sign(
      {
        otp: otp,
      },
      process.env.JWT_SECRET_KEY
    );
    console.log(otp);
    return res
      .cookie("tempUserToken", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 10,
        sameSite: "none",
      })
      .json({ err: false, tempUserToken: token });
  } catch (err) {
    res.status(400).json({ err: true, error: err.message });
  }
};
export async function resendEmail(req, res) {
  const { email } = req.body;
  try {
    const tempUserToken = req.cookies.tempUserToken;
    const verifiedTempToken = jwt.verify(
      tempUserToken,
      process.env.JWT_SECRET_KEY
    );
    let otp = verifiedTempToken.otp;
    console.log(otp);
    let otpSent = await otpHelper(email, otp);
    const token = jwt.sign(
      {
        otp: otp,
      },
      process.env.JWT_SECRET_KEY
    );
    return res
      .cookie("tempUserToken", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 10,
        sameSite: "none",
      })
      .json({ err: false, tempUserToken: token });
  } catch (err) {
    console.log(err);
    res.json({ error: err, err: true, message: "something went wrong" });
  }
}

export async function userRegisterVerify(req, res) {
  try {
    const { fullName, email, password, contactNumber, gender, otp } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.json({ err: true, message: "user Already Exist" });
    }
    // const hostel = JSON.parse(localStorage.getItem("hostel"));
    const tempUserToken = req.cookies.tempUserToken;
    if (!tempUserToken) {
      return res.json({ err: true, message: "OTP Session Timed Out" });
    }

    const verifiedTempToken = jwt.verify(
      tempUserToken,
      process.env.JWT_SECRET_KEY
    );

    if (otp != verifiedTempToken.otp) {
      return res.json({ err: true, message: "Invalid OTP" });
    }

    const hashPassword = bcrypt.hashSync(password, salt);

    const newUser = new UserModel({
      fullName,
      email,
      password: hashPassword,
      contactNumber,
      gender,
    });
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_SECRET_KEY
    );
    return res
      .cookie("token", token, {
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

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ err: true, message: "Invalid email or password" });
    }
    if (user.block) return res.json({ err: true, message: "You are blocked" });
    if (!user.password) {
      return res.json({ err: true, message: "You registered by google. Please goto google login" });
    }
    const userValid = bcrypt.compareSync(password, user.password);
    if (!userValid) return res.json({ err: true, message: "wrong Password" });

    const token = createToken(user._id);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "none",
      })
      .json({ err: false, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error, "error in controller");
  }
};
export const logoutUser = async (req, res) => {
  res
    .cookie("token", null, {
      httpOnly: true,
      secure: true,
      maxAge: 0,
      sameSite: "none",
    })
    .json({ err: false });
};

export const checkUserLoggedIn = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.json({ loggedIn: false, error: true, message: "no token" });
    const verifiedJWT = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(verifiedJWT.id, { password: 0 });
    // const user = await UserModel.findById(verifiedJWT.id).populate({path:'hostelData',populate:{path:'hostelId',model:'hostel'}}).populate({path:'hostelData',populate:{path:'userId',model:'user'}}).populate({path:'hostelData',populate:{path:'roomId',model:'room'}}).exec()
    if (!user) {
      return res.json({ loggedIn: false });
    }
    if (user.block) {
      return res.json({ loggedIn: false });
    }
    return res.json({ user, loggedIn: true, token });
  } catch (err) {
    console.log(err);
    res.json({ loggedIn: false, error: err });
  }
};
export async function googleAuthRedirect(req, res) {
  try {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.SERVER_URL + "/user/auth/google/callback";
    const { code } = req.query;
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }
    );

    const { access_token, id_token } = tokenResponse.data;
    const userInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );

    const user = {
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
    };

    let newUser = await UserModel.findOne({ email: user.email });

    if (!newUser) {
      newUser = await UserModel.create({
        email: user.email,
        image: { url: user.picture, secure_url: user.picture },
        fullName: user.name,
      });
    }

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY);
    res.redirect(`${process.env.CLIENT_URL}/google/callback?token=${token}`);
  } catch (error) {
    console.log("Google authentication error:", error);
    res.json({ err: true, error, message: "Google Authentication failed" });
  }
}

export async function verifyGAuth(req, res) {
  try {
    const token = req.query.token;
    if (!token) {
      return res.json({ loggedIn: false, err: true, message: "no token" });
    }
    const verifiedJWT = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!verifiedJWT) {
      return res.json({ loggedIn: false, err: true, message: "no token" });
    }
    const user = await UserModel.findById(verifiedJWT.id, { password: 0 });
    if (!user) {
      return res.json({ loggedIn: false, err: true, message: "no user found" });
    }
    if (user.block) {
      return res.json({ loggedIn: false, err: true, message: "user blocked" });
    }
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 30,
        sameSite: "none",
      })
      .json({ err: false, user: user._id, token });
  } catch (error) {
    console.log("Google authentication failed:", error);
    res.json({ err: true, error, message: "Google Authentication failed" });
  }
}
