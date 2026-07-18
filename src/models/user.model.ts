import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ALL_ROLES, ROLES, Role } from '../constants/roles';

export type Gender = 'Male' | 'Female' | 'Other';
export type UserStatus = 'pending' | 'active' | 'inactive' | 'suspended';
export type InstitutionType = 'Government' | 'Private' | 'Semi-Government';

export interface IUserProfile {
  // Student fields
  schoolName?: string;

  // School & Government fields
  institutionName?: string;
  institutionType?: InstitutionType;
  principalName?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  state?: string;
  department?: string;
  organizationName?: string;

  // Admin fields
  permissions?: string[];
}

export interface IUserDocument extends Document<Types.ObjectId> {
  fullName: string;
  age?: number;
  gender?: Gender;
  classGrade?: string;
  role: Role;
  email: string;
  phone?: string;
  currentToken?: string | null;
  isVerified: boolean;
  profile?: IUserProfile;
  status: UserStatus;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 5,
      max: 100,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    classGrade: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      required: true,
      default: ROLES.STUDENT,
    },

    // Contact & credentials
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    currentToken: {
      type: String,
      select: false,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Role-specific profile
    profile: {
      // Student fields
      schoolName: { type: String, trim: true },

      // School & Government fields
      institutionName: { type: String, trim: true },
      institutionType: {
        type: String,
      },
      principalName: { type: String, trim: true },
      contactPerson: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      department: { type: String, trim: true },
      organizationName: { type: String, trim: true },

      // Admin fields
      permissions: [{ type: String }],
    },

    // Account management
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'suspended'],
      default: 'pending',
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance (email already has a unique index)
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
