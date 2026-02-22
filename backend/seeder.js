import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    // Check if an admin already exists
    const adminExists = await Admin.findOne({ email: 'admin@felicity.com' });

    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit();
    }

    // Create the default admin
    await Admin.create({
      email: 'admin@felicity.com',
      password: 'admin_super_secret_password', 
    });

    console.log('Admin user seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
