// Import required modules
const express = require('express'); // Express framework for building APIs
const router = express.Router(); // Express router for defining route handlers
const WaitlistUser = require('../models/WaitlistUser'); // Mongoose model for waitlist users
const nodemailer = require('nodemailer'); // Nodemailer for sending emails

// Email transporter setup using Gmail and credentials from environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Gmail address from .env
    pass: process.env.GMAIL_PASS, // Gmail app password from .env
  },
});

// POST endpoint to add a user to the waitlist
router.post('/', async (req, res) => {
  const { email, name, referralCode } = req.body; // Extract data from request body
  // Email format validation using a simple regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    // If email is missing, return error
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  if (!emailRegex.test(email)) {
    // If email format is invalid, return error
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }
  try {
    // Create a new waitlist user document
    const user = new WaitlistUser({ email, name, referralCode });
    await user.save(); // Save user to MongoDB

    // Send confirmation email to the user (blocking, fails if error)
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER, // Sender address
        to: email, // Recipient address
        subject: 'Welcome to the Path忆 Waitlist!', // Email subject
        text: `Thanks for joining the waitlist${name ? ', ' + name : ''}! Your referral code: ${referralCode || 'N/A'}`,
      });
    } catch (emailErr) {
      // If email sending fails, log error and return error response
      console.error('Nodemailer error:', emailErr);
      return res.status(500).json({ success: false, error: 'Failed to send confirmation email. Please try again later.' });
    }

    // Count the number of users who joined before or at the same time as this user
    const count = await WaitlistUser.countDocuments({ joinedAt: { $lte: user.joinedAt } });

    // Return success response with user's position in the waitlist
    return res.status(200).json({ success: true, position: count });
  } catch (err) {
    // Log any other errors
    console.error('Waitlist POST error:', err);
    if (err.code === 11000) {
      // Duplicate email error (unique index violation)
      return res.status(409).json({ success: false, error: 'This email is already on the waitlist.' });
    }
    // Generic server error
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// GET endpoint to return the total number of users on the waitlist
router.get('/count', async (req, res) => {
  const count = await WaitlistUser.countDocuments(); // Count all waitlist users
  res.json({ count }); // Return count as JSON
});

// Export the router to be used in the main server file
module.exports = router;