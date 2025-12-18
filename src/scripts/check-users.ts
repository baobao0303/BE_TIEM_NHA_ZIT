import mongoose from 'mongoose';
import Employee from '../models/portals/auths/Employee';
import { MONGO_URI } from '../config';

const checkUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB via', MONGO_URI);

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees:`);
        employees.forEach(emp => {
            console.log(`- Name: ${emp.name}, Email: ${emp.email}, Role: ${emp.role}, GoogleId: ${emp.googleId}`);
        });

        if (employees.length === 0) {
            console.log('No employees found in the database.');
        }

    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkUsers();
