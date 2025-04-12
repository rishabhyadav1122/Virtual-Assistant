const express = require('express');
const passport = require("passport")
const { registerUser, verifyEmail, loginUser , forgotPassword , resetPassword , userData } = require("../controllers/authController.js")
const  authMiddleware  = require("../middlewares/authMiddleware");

const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/register", registerUser);
router.get("/userData",authMiddleware, userData);
router.get("/verifyEmail", verifyEmail);
router.post("/login", loginUser);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);


const generateJWT = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, // Payload
    process.env.JWT_SECRET, // Use a secret key from your .env file
    { expiresIn: "7d" } // Token expiration (adjust as needed)
  );
};
 
// Google Auth Route
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
  // Google Auth Callback
  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }), // Disable session
    (req, res) => {
      // Generate JWT token here
      const token = generateJWT(req.user); // Implement JWT generation logic

      res.redirect(`http://localhost:5173/login?auth_token=${token}`);
      // res.setHeader('Content-Type', 'text/html')
      // res.send(`
      //   <!DOCTYPE html>
      //   <html>
      //   <head>
      //     <script type="text/javascript">
      //       location.href = 'http://localhost:5173/login?auth_token=${token}'
      //     </script>
      //   </head>
      //   <body>
      //   </body>
      //   </html>
      //   `)
    }
  );
// Logout
router.get("/logout", (req, res) => {
    req.logout(() => {
      res.redirect("http://localhost:5173/");
    });
  });  

module.exports = router