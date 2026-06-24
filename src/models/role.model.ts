import mongoose, { Schema, Document, Types } from 'mongoose';
import { ALL_ROLES } from '../constants/roles';

export interface IRole {
  name: string;
  permissions: string[];
  description: string;
  isActive: boolean;
}

export interface IRoleDocument extends IRole, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      enum: ALL_ROLES,
      trim: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Role = mongoose.model<IRoleDocument>('Role', roleSchema);
