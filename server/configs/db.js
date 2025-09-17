import mongoose from 'mongoose';

const connectDB = async (uri) => {
  try {
    mongoose.connection.once('connected', () => {
      console.log('Database connected');
    });

    await mongoose.connect(uri);

    console.log('MongoDB connection established ✅');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
