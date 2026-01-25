import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error('❌ Error: MONGO_URI is not defined in environment variables'.red.bold);
      process.exit(1);
    }

    // DEBUG: Log a masked URI to verify it's being read correctly without exposing credentials
    const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//****:****@');
    console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`.cyan);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.green.bold);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`.red.bold);

    if (error.message.includes('IP not whitelisted')) {
      console.log('\n🔍 DIAGNOSIS: This is an IP Whitelist issue.'.yellow);
      console.log('1. Go to Atlas -> Network Access'.yellow);
      console.log('2. Ensure 0.0.0.0/0 is added and marked as "ACTIVE"'.yellow);
    }

    process.exit(1);
  }
};

export default connectDB;
