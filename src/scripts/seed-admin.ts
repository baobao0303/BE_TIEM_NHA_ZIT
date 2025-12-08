import 'dotenv/config';
import { connectDB } from '@/utils/db';
import Role from '@/models/portals/auths/Role';
import Admin from '@/models/portals/auths/Admin';
import { hashPassword } from '@/utils/auth';
import mongoose from 'mongoose';

const seedAdmin = async () => {
    try {
        await connectDB();

        console.log('Seeding Admin Role...');
        let adminRole = await Role.findOne({ slug: 'admin' });
        if (!adminRole) {
            adminRole = new Role({
                name: 'Administrator',
                slug: 'admin',
                description: 'Super Administrator with full access',
                permissions: ['*'],
                isDefault: false
            });
            await adminRole.save();
            console.log('Admin Role created.');
        } else {
             // Ensure it has wildcard permission
             if (!adminRole.permissions.includes('*')) {
                 adminRole.permissions.push('*');
                 await adminRole.save();
                 console.log('Admin Role updated with wildcard permission.');
             } else {
                 console.log('Admin Role already exists.');
             }
        }

        console.log('Seeding Admin User...');
        const email = 'admin@portal.com';
        const password = 'password123';
        
        let adminUser = await Admin.findOne({ email });
        if (!adminUser) {
            const hashedPassword = await hashPassword(password);
            adminUser = new Admin({
                name: 'Super Admin',
                email,
                password: hashedPassword,
                role: 'admin'
            });
            await adminUser.save();
            console.log(`Admin User created: ${email} / ${password}`);
        } else {
            console.log('Admin User already exists.');
        }

        console.log('Seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
