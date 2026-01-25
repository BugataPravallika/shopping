import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    console.log('--- Database Environment Check ---');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGO_URI Present:', !!uri);

    if (!uri) {
      console.error('❌ Error: MONGO_URI is not defined in environment variables');
      process.exit(1);
    }

    // DEBUG: Log a masked URI to verify it's being read correctly without exposing credentials
    const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//****:****@');
    console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
