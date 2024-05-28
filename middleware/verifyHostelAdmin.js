import jwt from 'jsonwebtoken'
import HostelAdminModel from '../models/hostelAdminModel.js';

const verifyHostelAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.hostelToken;

        if (!token)
            return res.json({ loggedIn: false, error: true, message: "no token" });
        const verifiedJWT = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const hostelAdmin = await HostelAdminModel.findById(verifiedJWT.id, { password: 0 });
  
        if (!hostelAdmin) {
            return res.json({ loggedIn: false });
        }
        req.hostelAdmin=hostelAdmin;
        next()
    } catch (err) {
        res.json({ loggedIn: false, error: err });
    }
}
export default verifyHostelAdmin