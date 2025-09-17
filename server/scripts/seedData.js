import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Connection from '../models/Connection.js';

dotenv.config();

const users = [
  {
    _id: 'dev_user_123',
    email: 'john@example.com',
    full_name: 'John Doe',
    username: 'johndoe',
    bio: 'Software Developer',
    location: 'New York',
    profile_picture: 'https://example.com/profile1.jpg',
    cover_photo: 'https://example.com/cover1.jpg',
  },
  {
    _id: 'dev_user_1234',
    email: 'jane@example.com',
    full_name: 'Jane Smith',
    username: 'janesmith',
    bio: 'UI/UX Designer',
    location: 'San Francisco',
  },
];

const posts = [
  {
    user: 'dev_user_123',
    content: 'Hello World! First post',
    post_type: 'text',
    likes_count: ['dev_user_1234'],
  },
  {
    user: 'dev_user_1234',
    content: 'Check out this image',
    image_urls: ['https://example.com/image1.jpg'],
    post_type: 'text_with_image',
    likes_count: ['dev_user_123'],
  },
];

const connections = [
  {
    from_user_id: 'dev_user_123',
    to_user_id: 'dev_user_1234',
    status: 'accepted',
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mydatabase');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Connection.deleteMany({});

    // Insert seed data
    await User.insertMany(users);
    await Post.insertMany(posts);
    await Connection.insertMany(connections);

    // Update user connections
    await User.findByIdAndUpdate('dev_user_123', {
      followers: ['dev_user_1234'],
      following: ['dev_user_1234'],
      connections: ['dev_user_1234'],
    });
    await User.findByIdAndUpdate('dev_user_1234', {
      followers: ['dev_user_123'],
      following: ['dev_user_123'],
      connections: ['dev_user_123'],
    });

    console.log('Seed data inserted successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
