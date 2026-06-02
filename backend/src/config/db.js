const mongoose = require('mongoose');

const connectDatabase = async () => {
  // Support both MONGO_URI and MONGODB_URI for flexibility
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGO_URI environment variable is not defined. Please check your .env file.');
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✓ Connected to MongoDB successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = { connectDatabase };
