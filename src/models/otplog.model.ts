import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type OtpPurpose = 'login' | 'resend';

export interface IOtpLogDocument extends Document<Types.ObjectId> {
  userId: Types.ObjectId;
  email?: string;
  phone?: string;
  otp: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const otpLogSchema = new Schema<IOtpLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['login', 'resend'],
      required: true,
      default: 'login',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

otpLogSchema.index({ userId: 1, createdAt: -1 });
otpLogSchema.index({ email: 1 });
otpLogSchema.index({ phone: 1 });

export const OtpLog: Model<IOtpLogDocument> = mongoose.model<IOtpLogDocument>(
  'OtpLog',
  otpLogSchema,
);
