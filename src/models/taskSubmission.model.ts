import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type TaskSubmissionStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export const TASK_SUBMISSION_STATUSES: TaskSubmissionStatus[] = [
  'pending',
  'under_review',
  'approved',
  'rejected',
];

export interface ITaskSubmissionProof {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface ITaskSubmissionDocument extends Document<Types.ObjectId> {
  studentId: Types.ObjectId;
  studentName: string;
  taskId: Types.ObjectId;
  taskTitle: string;
  description: string;
  proof: ITaskSubmissionProof;
  status: TaskSubmissionStatus;
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  reviewComment?: string | null;
  rejectionReason?: string | null;
  pointsEarned: number;
  badgeAwarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const proofSchema = new Schema<ITaskSubmissionProof>(
  {
    fileName: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    fileType: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const taskSubmissionSchema = new Schema<ITaskSubmissionDocument>(
  {
    // Student Details
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

    // Task Details (references the missions collection)
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Mission',
      required: true,
      index: true,
    },
    taskTitle: {
      type: String,
      required: true,
      trim: true,
    },

    // Submission
    description: {
      type: String,
      required: true,
      trim: true,
    },
    proof: {
      type: proofSchema,
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: TASK_SUBMISSION_STATUSES,
      default: 'pending',
      index: true,
    },

    // Review
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewComment: {
      type: String,
      trim: true,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    // Achievement
    pointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    badgeAwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'task_submissions',
  },
);

taskSubmissionSchema.index({ createdAt: -1 });
// Enforce a single submission per student per task (prevents duplicates).
taskSubmissionSchema.index({ studentId: 1, taskId: 1 }, { unique: true });

export const TaskSubmission: Model<ITaskSubmissionDocument> =
  mongoose.model<ITaskSubmissionDocument>('TaskSubmission', taskSubmissionSchema);
