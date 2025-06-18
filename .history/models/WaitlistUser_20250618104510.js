// Mongoose model for waitlist users
// This file defines the schema and model for users who join the waitlist
const mongoose = require('mongoose'); // Import Mongoose

// Define the schema for a waitlist user
const waitlistUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // User's email, must be unique
  name: { type: String }, // Optional user's name
  referralCode: { type: String }, // Optional referral code
  joinedAt: { type: Date, default: Date.now }, // Timestamp when user joined
});

// Create the model from the schema
const WaitlistUser = mongoose.model('WaitlistUser', waitlistUserSchema);

// Export the model for use in other files
module.exports = WaitlistUser;