import mongoose from 'mongoose';
import { MONGO_URI } from '@/config';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host} - URL: ${MONGO_URI}`);
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};
