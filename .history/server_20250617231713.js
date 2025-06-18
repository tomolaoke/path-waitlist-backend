require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const waitlistRoutes = require('./routes/waitlist');

const app = express();
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(cors({ origin: 'http://localhost:5173' })); // or your frontend port
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected join the waitlist!'))
  .catch(err => console.error(err));

app.use('/api/waitlist', waitlistRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));