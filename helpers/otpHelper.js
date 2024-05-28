import nodemailer from "nodemailer";

export default function sendOTP(email, otp) {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "HostelWeb Email verification",
      html: `
              <h1>Verify Your Email For HostelWeb</h1>
                <h3>use this code in HostelWeb to verify your email</h3>
                <h2>${otp}</h2>
              `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("error", error, info);
        reject(error);
      } else {
        console.log("success");
        resolve({ success: true, message: "Email sent successfull" });
      }
    });
  });
}
