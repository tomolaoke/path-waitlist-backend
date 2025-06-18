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
  try {
    const user = new WaitlistUser({ email, name, referralCode });
    await user.save();

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Welcome to the Path忆 Waitlist!',
      text: `Thanks for joining the waitlist${name ? ', ' + name : ''}! Your referral code: ${referralCode || 'N/A'}`,
    });

    // Get position
    const count = await WaitlistUser.countDocuments({ joinedAt: { $lte: user.joinedAt } });

    res.json({ success: true, position: count });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Email already on waitlist.' });
    }
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// Get waitlist count
router.get('/count', async (req, res) => {
  const count = await WaitlistUser.countDocuments();
  res.json({ count });
});

module.exports = router;