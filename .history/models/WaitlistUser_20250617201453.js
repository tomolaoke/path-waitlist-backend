const mongoose = require('mongoose');

const WaitlistUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  referralCode: String,
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WaitlistUser', WaitlistUserSchema);