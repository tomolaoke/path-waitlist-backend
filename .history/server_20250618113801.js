require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Import Express framework
const mongoose = require('mongoose'); // Import Mongoose for MongoDB
const cors = require('cors'); // Import CORS middleware

const waitlistRoutes = require('./routes/waitlist'); // Import waitlist route handlers
const journeyRoutes = require('./routes/journey'); // Import journey route handlers

const app = express(); // Create Express app instance
app.use(cors({ origin: 'http://localhost:8080' })); // Enable CORS for frontend at this origin
// app.use(cors({ origin: 'http://localhost:5173' })); // Alternative frontend port
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB using connection string from environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected join the waitlist!')) // Log success
  .catch(err => console.error(err)); // Log connection errors

// Use the waitlist routes for any requests to /api/waitlist
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/journeys', journeyRoutes); // Use the journey routes for /api/journeys

const PORT = process.env.PORT || 4000; // Set server port from env or default to 4000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start server and log port