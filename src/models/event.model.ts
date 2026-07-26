import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type EventType = 'public' | 'private';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export const EVENT_STATUSES: EventStatus[] = ['upcoming', 'ongoing', 'completed', 'cancelled'];

export interface IEventDocument extends Document<Types.ObjectId> {
  title: string;
  description: string;
  categoryId: Types.ObjectId;
  city: string;
  eventDate: Date;
  eventType: EventType;
  schoolIds: Types.ObjectId[];
  governmentIds: Types.ObjectId[];
  status: EventStatus;
  totalParticipants: number;
  maxParticipants: number;
  is_active: boolean;
  created_by?: Types.ObjectId | null;
  updated_by?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'EventCategory',
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['public', 'private'],
      required: true,
      index: true,
    },
    schoolIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    governmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: EVENT_STATUSES,
      default: 'upcoming',
      index: true,
    },
    totalParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    // 0 means unlimited participants.
    maxParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
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
    collection: 'events',
  },
);

eventSchema.index({ title: 'text', description: 'text', city: 'text' });
eventSchema.index({ eventDate: 1, createdAt: -1 });
eventSchema.index({ eventType: 1, schoolIds: 1 });
eventSchema.index({ eventType: 1, governmentIds: 1 });
eventSchema.index({ schoolIds: 1 });
eventSchema.index({ governmentIds: 1 });

export const Event: Model<IEventDocument> = mongoose.model<IEventDocument>('Event', eventSchema);
