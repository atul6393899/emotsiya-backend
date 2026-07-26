import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ALL_ROLES, Role } from '../constants/roles';

export interface IExpertSessionParticipantDocument extends Document<Types.ObjectId> {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userRole: Role;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expertSessionParticipantSchema = new Schema<IExpertSessionParticipantDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpertSession',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userRole: {
      type: String,
      enum: ALL_ROLES,
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'expert_session_participants',
  },
);

// Prevent the same user from joining the same session twice.
expertSessionParticipantSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

export const ExpertSessionParticipant: Model<IExpertSessionParticipantDocument> =
  mongoose.model<IExpertSessionParticipantDocument>(
    'ExpertSessionParticipant',
    expertSessionParticipantSchema,
  );
