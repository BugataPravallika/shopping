import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}
connectDB();
