const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db'); // Adjust the path as needed
const authRoutes = require("./routes/authRoutes.js")
const commandRoutes = require("./routes/commandRoutes.js")
const passport = require("passport")
const session = require("express-session")
require("./config/passport.js")



// Import the cron job


// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Adjust based on frontend URL
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// Connect to MongoDB
connectDB()

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/command", commandRoutes);

//Google OAuth
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

// Basic route to confirm the server is running
app.get('/', (req, res) => {
  res.send('Assistant API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));