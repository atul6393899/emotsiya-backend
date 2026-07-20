import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface IMissionDocument extends Document<Types.ObjectId> {
  title: string;
  eventId: Types.ObjectId;
  rewardPoints: number;
  deadline: Date;
  difficulty: MissionDifficulty;
  description: string;
  is_active: boolean;
  created_by?: Types.ObjectId | null;
  updated_by?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const missionSchema = new Schema<IMissionDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    rewardPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    deadline: {
      type: Date,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
    collection: 'missions',
  },
);

missionSchema.index({ title: 'text', description: 'text' });
missionSchema.index({ createdAt: -1 });
missionSchema.index({ deadline: 1, createdAt: -1 });
missionSchema.index({ rewardPoints: -1 });

export const Mission: Model<IMissionDocument> = mongoose.model<IMissionDocument>(
  'Mission',
  missionSchema,
);
