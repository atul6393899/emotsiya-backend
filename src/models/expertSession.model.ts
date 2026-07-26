import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ExpertSessionStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export const EXPERT_SESSION_STATUSES: ExpertSessionStatus[] = [
  'UPCOMING',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
];

export interface IExpertSessionDocument extends Document<Types.ObjectId> {
  title: string;
  description: string;
  expertName: string;
  sessionDate: Date;
  startTime: string;
  endTime: string;
  zoomLink: string;
  zoomMeetingId?: string | null;
  zoomPassword?: string | null;
  status: ExpertSessionStatus;
  is_active: boolean;
  totalJoined: number;
  created_by?: Types.ObjectId | null;
  updated_by?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const expertSessionSchema = new Schema<IExpertSessionDocument>(
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
    expertName: {
      type: String,
      required: true,
      trim: true,
    },
    sessionDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    zoomLink: {
      type: String,
      required: true,
      trim: true,
    },
    zoomMeetingId: {
      type: String,
      trim: true,
      default: null,
    },
    zoomPassword: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: EXPERT_SESSION_STATUSES,
      default: 'UPCOMING',
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    totalJoined: {
      type: Number,
      default: 0,
      min: 0,
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
    collection: 'expert_sessions',
  },
);

expertSessionSchema.index({ createdAt: -1 });
expertSessionSchema.index({ sessionDate: 1, createdAt: -1 });
expertSessionSchema.index({ title: 'text', description: 'text', expertName: 'text' });

export const ExpertSession: Model<IExpertSessionDocument> = mongoose.model<IExpertSessionDocument>(
  'ExpertSession',
  expertSessionSchema,
);
