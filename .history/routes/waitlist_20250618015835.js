const express = require('express');
const router = express.Router();
const WaitlistUser = require('../models/WaitlistUser');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Add to waitlist
router.post('/', async (req, res) => {
  const { email, name, referralCode } = req.body;
  // Email format validation (simple regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }
  try {
    const user = new WaitlistUser({ email, name, referralCode });
    await user.save();

    // Send confirmation email (blocking, fail if error)
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Welcome to the Path忆 Waitlist!',
        text: `Thanks for joining the waitlist${name ? ', ' + name : ''}! Your referral code: ${referralCode || 'N/A'}`,
      });
    } catch (emailErr) {
      console.error('Nodemailer error:', emailErr);
      return res.status(500).json({ success: false, error: 'Failed to send confirmation email. Please try again later.' });
    }

    // Get position
    const count = await WaitlistUser.countDocuments({ joinedAt: { $lte: user.joinedAt } });

    return res.status(200).json({ success: true, position: count });
  } catch (err) {
    console.error('Waitlist POST error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'This email is already on the waitlist.' });
    }
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// Get waitlist count
router.get('/count', async (req, res) => {
  const count = await WaitlistUser.countDocuments();
  res.json({ count });
});

module.exports = router;