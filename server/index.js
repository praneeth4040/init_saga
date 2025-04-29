const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 3000;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Assuming your frontend runs on port 5173 (Vite's default)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const priceRoutes = require('./routes/priceRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
