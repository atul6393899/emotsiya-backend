import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { logger } from '../config/logger';

const SEED_USERS = [
  {
    name: 'Admin',
    email: 'admin@example.com',
    password: '123456',
    role: 'admin',
  },
  {
    name: 'School',
    email: 'school@example.com',
    password: '123456',
    role: 'school',
  },
  {
    name: 'Government',
    email: 'gov@example.com',
    password: '123456',
    role: 'government',
  },
  {
    name: 'Student',
    email: 'satya@example.com',
    password: '123456',
    role: 'student',
  },
];

const seed = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI!;
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding');

    for (const userData of SEED_USERS) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        logger.info(`User ${userData.email} already exists, skipping`);
        continue;
      }
      await User.create(userData);
      logger.info(`Created ${userData.role} user: ${userData.email}`);
    }

    logger.info('Seeding completed successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
