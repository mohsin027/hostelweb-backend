import "dotenv/config.js";
import express from "express";
import morgan from "morgan";
import dbConfig from "./config/dbConfig.js";
import userAuthRouter from "./routes/userAuthRouter.js";
import hostelAuthRouter from "./routes/hostelAuthRouter.js";
import hostelRouter from "./routes/hostelRouter.js";
import adminRouter from "./routes/adminRouter.js";
import adminAuthRouter from "./routes/adminAuthRouter.js";
import userRouter from "./routes/userRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import verifyUser from "./middleware/verifyUser.js";
import verifyAdmin from "./middleware/verifyAdmin.js";
import verifyHostelAdmin from "./middleware/verifyHostelAdmin.js";
const app = express();
app.use(morgan("common"));
dbConfig();
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://hostelsweb.netlify.app",
    ],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/user/auth", userAuthRouter);
app.use("/hostel/auth", hostelAuthRouter);
app.use("/admin/auth", adminAuthRouter);
app.use("/user/", verifyUser, userRouter);
app.use("/hostel/hostel", verifyHostelAdmin, hostelRouter);
app.use("/admin/", verifyAdmin, adminRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server running on ${port}`);
});
