import mongoose from 'mongoose';

import fetch from 'node-fetch';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    // Log Public IP for Whitelist Verification
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      console.log(`🌍 Server Public IP: ${data.ip}`);
    } catch (e) {
      console.log('🌍 Could not determine public IP');
    }

    console.log('--- Database Environment Check ---');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGO_URI Present:', !!uri);

    if (!uri) {
      console.error('❌ Error: MONGO_URI is not defined in environment variables');
      process.exit(1);
    }

    const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//****:****@');
    console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // FORCE IPv4 (Common fix for Render/Atlas)
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
