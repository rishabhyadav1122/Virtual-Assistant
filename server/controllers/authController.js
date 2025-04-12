const  User =  require("../models/User.js");
const bcrypt =  require("bcryptjs");
const  jwt =  require("jsonwebtoken");
const dotenv =  require("dotenv");
const { z } = require('zod');
const  sendEmail =  require("../utils/sendEmail.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");



dotenv.config();


// Zod Schema for Signup Validation
const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register User
const registerUser = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const { name, email, password } = validatedData;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists", success: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    await sendEmail(user.email, "Verify Your Email", `Click to verify: http://localhost:5173/verifyEmail?token=${token}`);

    res.status(201).json({ message: "User registered. Check email for verification.", success: true , token:`${token}`  });
  } catch (error) {
    res.status(400).json({ message: error.errors || "Invalid data", success: false });
  }
};

const userData = async(req,res)=>{
  try {
      const userData = await  req.user
      console.log(userData)
      return res.status(200).json({userData })
  } catch (error) {
      console.log(`Error from User route ${error}`);
      
  }
}


// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" , success: false });

    user.isVerified = true;
    await user.save();
    const auth_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });


    res.json({ message: "Email verified successfully!" , success: true , auth_token });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" , success: false });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isVerified) return res.status(403).json({ message: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(400).json({ message: "Login failed" });
  }
};

const forgotPassword =  async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ 1. Check if the email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ 2. Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // Token valid for 10 mins

    // ✅ 3. Save token & expiry in the database
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // ✅ 4. Send password reset email
    const resetLink = `https://study-hub-mq4a.vercel.app/resetPassword/${resetToken}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password. This link will expire in 10 minutes.</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: "Password reset link sent to email" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // ✅ 1. Find user by token & check expiry
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ 2. Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // ✅ 3. Remove reset token
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return res.json({ message: "Password has been reset successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


module.exports = {registerUser , verifyEmail , loginUser , forgotPassword , resetPassword , userData}
