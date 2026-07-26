import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AttendanceStatus = 'registered' | 'attended' | 'absent';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['registered', 'attended', 'absent'];

export interface IEventParticipantDocument extends Document<Types.ObjectId> {
  eventId: Types.ObjectId;
  studentId: Types.ObjectId;
  studentName: string;
  schoolId?: Types.ObjectId | null;
  joinedAt: Date;
  attendanceStatus: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const eventParticipantSchema = new Schema<IEventParticipantDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    attendanceStatus: {
      type: String,
      enum: ATTENDANCE_STATUSES,
      default: 'registered',
    },
  },
  {
    timestamps: true,
    collection: 'event_participants',
  },
);

// A student can only register once per event.
eventParticipantSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export const EventParticipant: Model<IEventParticipantDocument> =
  mongoose.model<IEventParticipantDocument>('EventParticipant', eventParticipantSchema);
