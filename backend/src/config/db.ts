import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://98.93.220.96:27017/canteen';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}
