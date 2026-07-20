import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { seedEventCategories } from './seedEventCategories';
import { DEFAULT_EVENT_CATEGORIES } from '../constants/default-event-categories';
import { logger } from '../config/logger';

const SEED_USERS = [
  {
    fullName: 'Admin',
    email: 'admin@example.com',
    phone: '9876543210',
    role: 'admin',
    isVerified: true,
    status: 'active',
  },
  {
    fullName: 'School',
    email: 'school@example.com',
    phone: '9876543211',
    role: 'school',
    isVerified: true,
    status: 'active',
  },
  {
    fullName: 'Government',
    email: 'gov@example.com',
    phone: '9876543212',
    role: 'government',
    isVerified: true,
    status: 'active',
  },
  {
    fullName: 'Student',
    email: 'satya@example.com',
    phone: '9876543213',
    role: 'student',
    isVerified: true,
    status: 'active',
  },
];

const seed = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI!;
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding');

    for (const userData of SEED_USERS) {
      await User.findOneAndUpdate({ email: userData.email }, userData, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
      logger.info(`Upserted ${userData.role} user: ${userData.email}`);
    }

    const { inserted, skipped } = await seedEventCategories();
    logger.info(
      `Event categories: inserted ${inserted}, skipped ${skipped} (of ${DEFAULT_EVENT_CATEGORIES.length})`,
    );

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
