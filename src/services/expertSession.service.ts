import { Types } from 'mongoose';
import {
  ExpertSession,
  IExpertSessionDocument,
  ExpertSessionStatus,
} from '../models/expertSession.model';
import { ExpertSessionParticipant } from '../models/expertSessionParticipant.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { isValidObjectId, getPaginationParams, buildPaginationMeta } from '../utils/helpers';
import { Role, ALL_ROLES } from '../constants/roles';

const LIST_SELECT =
  '_id title description expertName sessionDate startTime endTime zoomLink zoomMeetingId status is_active totalJoined createdAt';

const JOINABLE_STATUSES: ExpertSessionStatus[] = ['UPCOMING', 'ONGOING'];

export interface ICreateExpertSessionRequest {
  title: string;
  description: string;
  expertName: string;
  sessionDate: string | Date;
  startTime: string;
  endTime: string;
  zoomLink: string;
  zoomMeetingId?: string;
  zoomPassword?: string;
}

export interface IUpdateExpertSessionRequest {
  title?: string;
  description?: string;
  expertName?: string;
  sessionDate?: string | Date;
  startTime?: string;
  endTime?: string;
  zoomLink?: string;
  zoomMeetingId?: string;
  zoomPassword?: string;
  status?: ExpertSessionStatus;
  is_active?: boolean;
}

export interface IExpertSessionListQuery {
  search?: string;
  page?: number;
  limit?: number;
  status?: ExpertSessionStatus;
  fromDate?: string | Date;
  toDate?: string | Date;
  is_active?: boolean;
}

export interface IExpertSessionParticipantsQuery {
  page?: number;
  limit?: number;
  role?: Role;
  search?: string;
}

export interface IExpertSessionResponse {
  _id: string;
  title: string;
  description: string;
  expertName: string;
  sessionDate: Date | string;
  startTime: string;
  endTime: string;
  zoomLink: string;
  zoomMeetingId?: string | null;
  zoomPassword?: string | null;
  status: ExpertSessionStatus;
  is_active: boolean;
  totalJoined: number;
  hasJoined?: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IExpertSessionListResponse {
  sessions: IExpertSessionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IJoinExpertSessionResponse {
  sessionId: string;
  joinedAt: Date | string;
  totalJoined: number;
}

export interface IJoinCountResponse {
  sessionId: string;
  title: string;
  totalJoined: number;
}

export interface IParticipantItem {
  _id: string;
  userId: string;
  userName: string;
  userRole: Role;
  joinedAt: Date | string;
}

export interface IParticipantsListResponse {
  participants: IParticipantItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalJoined: number;
}

export class ExpertSessionService {
  async createExpertSession(
    data: ICreateExpertSessionRequest,
    userId?: string,
  ): Promise<IExpertSessionResponse> {
    this.assertWeekend(data.sessionDate);
    this.assertTimeOrder(data.startTime, data.endTime);

    const adminId = userId && isValidObjectId(userId) ? userId : null;

    const session = await ExpertSession.create({
      title: data.title.trim(),
      description: data.description.trim(),
      expertName: data.expertName.trim(),
      sessionDate: new Date(data.sessionDate),
      startTime: data.startTime.trim(),
      endTime: data.endTime.trim(),
      zoomLink: data.zoomLink.trim(),
      zoomMeetingId: data.zoomMeetingId?.trim() || null,
      zoomPassword: data.zoomPassword?.trim() || null,
      status: 'UPCOMING',
      is_active: true,
      totalJoined: 0,
      created_by: adminId,
      updated_by: adminId,
    });

    return this.getExpertSessionById(session._id.toString(), userId);
  }

  async getExpertSessions(
    query: IExpertSessionListQuery = {},
    isAdmin = false,
    userId?: string,
  ): Promise<IExpertSessionListResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = this.buildListFilter(query, isAdmin);

    const [sessions, total] = await Promise.all([
      ExpertSession.find(filter)
        .select(LIST_SELECT)
        .sort({ sessionDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ExpertSession.countDocuments(filter),
    ]);

    const joinedSet = await this.getJoinedSessionIds(
      userId,
      sessions.map((s) => (s._id as { toString(): string }).toString()),
    );

    const meta = buildPaginationMeta(total, page, limit);

    return {
      sessions: sessions.map((session) =>
        this.mapSession(session, joinedSet.has((session._id as { toString(): string }).toString())),
      ),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  async getExpertSessionById(id: string, userId?: string): Promise<IExpertSessionResponse> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const session = await ExpertSession.findById(id).lean();
    if (!session) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Expert session not found');
    }

    const hasJoined = userId ? await this.hasUserJoined(id, userId) : false;
    return this.mapSession(session, hasJoined);
  }

  async updateExpertSession(
    id: string,
    data: IUpdateExpertSessionRequest,
    userId?: string,
  ): Promise<IExpertSessionResponse> {
    const session = await this.findSessionById(id);

    if (data.sessionDate !== undefined) {
      this.assertWeekend(data.sessionDate);
      session.sessionDate = new Date(data.sessionDate);
    }

    const nextStart = data.startTime ?? session.startTime;
    const nextEnd = data.endTime ?? session.endTime;
    if (data.startTime !== undefined || data.endTime !== undefined) {
      this.assertTimeOrder(nextStart, nextEnd);
    }

    if (data.title !== undefined) {
      session.title = data.title.trim();
    }
    if (data.description !== undefined) {
      session.description = data.description.trim();
    }
    if (data.expertName !== undefined) {
      session.expertName = data.expertName.trim();
    }
    if (data.startTime !== undefined) {
      session.startTime = data.startTime.trim();
    }
    if (data.endTime !== undefined) {
      session.endTime = data.endTime.trim();
    }
    if (data.zoomLink !== undefined) {
      session.zoomLink = data.zoomLink.trim();
    }
    if (data.zoomMeetingId !== undefined) {
      session.zoomMeetingId = data.zoomMeetingId.trim() || null;
    }
    if (data.zoomPassword !== undefined) {
      session.zoomPassword = data.zoomPassword.trim() || null;
    }
    if (data.status !== undefined) {
      session.status = data.status;
    }
    if (data.is_active !== undefined) {
      session.is_active = data.is_active;
    }
    if (userId && isValidObjectId(userId)) {
      session.updated_by = new Types.ObjectId(userId);
    }

    await session.save();

    return this.getExpertSessionById(id, userId);
  }

  async deleteExpertSession(id: string): Promise<void> {
    await this.findSessionById(id);
    await Promise.all([
      ExpertSession.findByIdAndDelete(id),
      ExpertSessionParticipant.deleteMany({ sessionId: new Types.ObjectId(id) }),
    ]);
  }

  async joinExpertSession(
    sessionId: string,
    userId: string,
    userRole: string,
  ): Promise<IJoinExpertSessionResponse> {
    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
    }

    const session = await this.findSessionById(sessionId);

    if (!session.is_active) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This expert session is inactive');
    }

    if (!JOINABLE_STATUSES.includes(session.status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Cannot join a session with status ${session.status}`,
      );
    }

    const user = await User.findById(userId).select('_id fullName role').lean();
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    const role = (user.role || userRole) as Role;
    if (!ALL_ROLES.includes(role)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Invalid user role');
    }

    const alreadyJoined = await ExpertSessionParticipant.findOne({
      sessionId: session._id,
      userId: user._id,
    })
      .select('_id')
      .lean();

    if (alreadyJoined) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'You have already joined this session');
    }

    const joinedAt = new Date();

    try {
      await ExpertSessionParticipant.create({
        sessionId: session._id,
        userId: user._id,
        userName: user.fullName,
        userRole: role,
        joinedAt,
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'You have already joined this session');
      }
      throw error;
    }

    const updated = await ExpertSession.findByIdAndUpdate(
      session._id,
      { $inc: { totalJoined: 1 } },
      { new: true },
    )
      .select('totalJoined')
      .lean();

    return {
      sessionId: session._id.toString(),
      joinedAt,
      totalJoined: updated?.totalJoined ?? session.totalJoined + 1,
    };
  }

  async getExpertSessionJoinCount(sessionId: string): Promise<IJoinCountResponse> {
    if (!isValidObjectId(sessionId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const session = await ExpertSession.findById(sessionId).select('_id title totalJoined').lean();
    if (!session) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Expert session not found');
    }

    return {
      sessionId: session._id.toString(),
      title: session.title,
      totalJoined: session.totalJoined ?? 0,
    };
  }

  async getExpertSessionParticipants(
    sessionId: string,
    query: IExpertSessionParticipantsQuery = {},
  ): Promise<IParticipantsListResponse> {
    if (!isValidObjectId(sessionId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const session = await ExpertSession.findById(sessionId).select('_id totalJoined').lean();
    if (!session) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Expert session not found');
    }

    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter: Record<string, unknown> = {
      sessionId: new Types.ObjectId(sessionId),
    };

    if (query.role) {
      filter.userRole = query.role;
    }

    const search = query.search?.trim();
    if (search) {
      filter.userName = new RegExp(this.escapeRegex(search), 'i');
    }

    const [participants, total] = await Promise.all([
      ExpertSessionParticipant.find(filter)
        .select('_id userId userName userRole joinedAt')
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ExpertSessionParticipant.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      participants: participants.map((p) => ({
        _id: (p._id as { toString(): string }).toString(),
        userId: (p.userId as { toString(): string }).toString(),
        userName: p.userName,
        userRole: p.userRole,
        joinedAt: p.joinedAt,
      })),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
      totalJoined: session.totalJoined ?? 0,
    };
  }

  private async findSessionById(id: string): Promise<IExpertSessionDocument> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const session = await ExpertSession.findById(id);
    if (!session) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Expert session not found');
    }

    return session;
  }

  private async hasUserJoined(sessionId: string, userId: string): Promise<boolean> {
    if (!isValidObjectId(userId)) {
      return false;
    }
    const existing = await ExpertSessionParticipant.findOne({
      sessionId: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    })
      .select('_id')
      .lean();
    return Boolean(existing);
  }

  private async getJoinedSessionIds(
    userId: string | undefined,
    sessionIds: string[],
  ): Promise<Set<string>> {
    if (!userId || !isValidObjectId(userId) || sessionIds.length === 0) {
      return new Set();
    }

    const joined = await ExpertSessionParticipant.find({
      userId: new Types.ObjectId(userId),
      sessionId: { $in: sessionIds.map((id) => new Types.ObjectId(id)) },
    })
      .select('sessionId')
      .lean();

    return new Set(joined.map((j) => (j.sessionId as { toString(): string }).toString()));
  }

  private assertWeekend(date: string | Date): void {
    const day = new Date(date).getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'sessionDate must fall on a Saturday or Sunday');
    }
  }

  private assertTimeOrder(startTime: string, endTime: string): void {
    if (startTime && endTime && endTime <= startTime) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'endTime must be greater than startTime');
    }
  }

  private buildListFilter(
    query: IExpertSessionListQuery,
    isAdmin: boolean,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    // Non-admin users only ever see active sessions.
    if (isAdmin) {
      if (typeof query.is_active === 'boolean') {
        filter.is_active = query.is_active;
      }
    } else {
      filter.is_active = true;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.fromDate || query.toDate) {
      const dateRange: Record<string, Date> = {};
      if (query.fromDate) {
        const from = new Date(query.fromDate);
        from.setHours(0, 0, 0, 0);
        dateRange.$gte = from;
      }
      if (query.toDate) {
        const to = new Date(query.toDate);
        to.setHours(23, 59, 59, 999);
        dateRange.$lte = to;
      }
      filter.sessionDate = dateRange;
    }

    const search = query.search?.trim();
    if (search) {
      const regex = new RegExp(this.escapeRegex(search), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { expertName: regex }];
    }

    return filter;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private mapSession(session: Record<string, unknown>, hasJoined = false): IExpertSessionResponse {
    return {
      _id: (session._id as { toString(): string }).toString(),
      title: session.title as string,
      description: session.description as string,
      expertName: session.expertName as string,
      sessionDate: session.sessionDate as Date,
      startTime: session.startTime as string,
      endTime: session.endTime as string,
      zoomLink: session.zoomLink as string,
      zoomMeetingId: (session.zoomMeetingId as string | null) ?? null,
      zoomPassword: (session.zoomPassword as string | null) ?? undefined,
      status: session.status as ExpertSessionStatus,
      is_active: session.is_active as boolean,
      totalJoined: (session.totalJoined as number) ?? 0,
      hasJoined,
      created_by: session.created_by
        ? (session.created_by as { toString(): string }).toString()
        : null,
      updated_by: session.updated_by
        ? (session.updated_by as { toString(): string }).toString()
        : null,
      createdAt: session.createdAt as Date | undefined,
      updatedAt: session.updatedAt as Date | undefined,
    };
  }
}
