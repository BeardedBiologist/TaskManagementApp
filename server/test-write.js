import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const testWrite = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      name: { first: 'Test', last: 'User' }
    });

    console.log('Attempting to save test user...');
    await testUser.save();
    console.log('Test user saved successfully.');

    console.log('Attempting to delete test user...');
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Test user deleted successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Error testing write:', err);
    process.exit(1);
  }
};

testWrite();
