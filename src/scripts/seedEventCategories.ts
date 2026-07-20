import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { EventCategory } from '../models/eventcategory.model';
import { DEFAULT_EVENT_CATEGORIES } from '../constants/default-event-categories';
import { logger } from '../config/logger';

export const seedEventCategories = async (): Promise<{ inserted: number; skipped: number }> => {
  let inserted = 0;
  let skipped = 0;

  for (const category of DEFAULT_EVENT_CATEGORIES) {
    const result = await EventCategory.updateOne(
      { name: category.name },
      {
        $setOnInsert: {
          name: category.name,
          icon: category.icon,
          sort_order: category.sort_order,
          description: '',
          color: '',
          is_active: true,
        },
      },
      { upsert: true },
    );

    if (result.upsertedCount > 0) {
      inserted += 1;
      logger.info(`Inserted category: ${category.icon} ${category.name}`);
    } else {
      skipped += 1;
      logger.info(`Skipped (already exists): ${category.icon} ${category.name}`);
    }
  }

  return { inserted, skipped };
};

const run = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI!;
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for event category seeding');

    const { inserted, skipped } = await seedEventCategories();
    logger.info(
      `Event category seeding complete. Inserted: ${inserted}, Skipped: ${skipped}, Total: ${DEFAULT_EVENT_CATEGORIES.length}`,
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Event category seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
