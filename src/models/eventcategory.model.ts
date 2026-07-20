import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IEventCategoryDocument extends Document<Types.ObjectId> {
  name: string;
  icon: string;
  description?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
  created_by?: Types.ObjectId | null;
  updated_by?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const eventCategorySchema = new Schema<IEventCategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    sort_order: {
      type: Number,
      default: 0,
      index: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'event_categories',
  },
);

eventCategorySchema.index({ sort_order: 1, createdAt: -1 });

export const EventCategory: Model<IEventCategoryDocument> = mongoose.model<IEventCategoryDocument>(
  'EventCategory',
  eventCategorySchema,
);
