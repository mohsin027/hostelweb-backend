import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AdminModel from "../models/adminModel.js";

var salt = bcrypt.genSaltSync(10);

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    const admin = await AdminModel.findOne({ email });
    if (!admin)
      return res.json({ err: true, message: "No admin admin found" });
    if (admin.block)
      return res.json({ err: true, message: "You are blocked" });
    if (!admin.password) {
      return res.json({ err: true, message: "Please login" });
    }
    const adminValid = bcrypt.compareSync(password, admin.password);
    if (!adminValid) return res.json({ err: true, message: "wrong Password" });
    const adminToken = jwt.sign(
      {
        id: admin._id,
      },
      process.env.JWT_SECRET_KEY
    );
    return res
      .cookie("adminToken", adminToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 30,
        sameSite: "none",
      })
      .json({ err: false, admin, adminToken });
  } catch (err) {
    console.log(err);
    res.json({ message: "server error", err: true, error: err });
  }
}

export const logoutAdmin = async (req, res) => {
  res
    .cookie("adminToken", null, {
      httpOnly: true,
      secure: true,
      maxAge: 0,
      sameSite: "none",
    })
    .json({ err: false });
};

export const checkAdminLoggedIn = async (req, res) => {
  try {
    const adminToken = req.cookies.adminToken;
    if (!adminToken)
      return res.json({ loggedIn: false, error: true, message: "no token" });
    const verifiedJWT = jwt.verify(adminToken, process.env.JWT_SECRET_KEY);
    const admin = await AdminModel.findById(verifiedJWT.id, {
      password: 0,
    });
    if (!admin) {
      return res.json({ loggedIn: false });
    }
    if (admin.block) {
      return res.json({ loggedIn: false });
    }
    return res.json({ admin, loggedIn: true, adminToken });
  } catch (err) {
    console.log(err);
    res.json({ loggedIn: false, error: err });
  }
};
