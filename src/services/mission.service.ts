import { Types } from 'mongoose';
import { Mission, IMissionDocument, MissionDifficulty } from '../models/mission.model';
import { Event } from '../models/event.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { isValidObjectId, getPaginationParams, buildPaginationMeta } from '../utils/helpers';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const POPULATE_EVENT = '_id title eventDate';

export interface ICreateMissionRequest {
  title: string;
  eventId: string;
  rewardPoints: number;
  deadline: string | Date;
  difficulty: MissionDifficulty;
  description: string;
  is_active?: boolean;
}

export interface IMissionListQuery {
  search?: string;
  page?: number;
  limit?: number;
  difficulty?: MissionDifficulty;
  eventId?: string;
  is_active?: boolean;
  fromDate?: string | Date;
  toDate?: string | Date;
  minRewardPoints?: number;
  maxRewardPoints?: number;
  sortBy?: 'createdAt' | 'deadline' | 'rewardPoints' | 'title';
  sortOrder?: 'asc' | 'desc';
  sort_by?: 'createdAt' | 'deadline' | 'rewardPoints' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface IMissionEventDropdownQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface IEventSummary {
  _id: string;
  title: string;
  eventDate: Date | string;
}

export interface IMissionResponse {
  _id: string;
  title: string;
  event: IEventSummary | null;
  eventId?: string;
  rewardPoints: number;
  deadline: Date | string;
  difficulty: MissionDifficulty;
  description: string;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMissionListResponse {
  missions: IMissionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IMissionEventDropdownResponse {
  events: IEventSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class MissionService {
  async getMissionEventDropdown(
    query: IMissionEventDropdownQuery = {},
  ): Promise<IMissionEventDropdownResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = this.buildMissionEventDropdownFilter(query);

    const [events, total] = await Promise.all([
      Event.find(filter)
        .select('_id title eventDate')
        .sort({ eventDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      events: events.map((event) => ({
        _id: event._id.toString(),
        title: event.title,
        eventDate: event.eventDate,
      })),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  async createMission(data: ICreateMissionRequest, userId?: string): Promise<IMissionResponse> {
    await this.validateEligibleEvent(data.eventId);

    const mission = await Mission.create({
      title: data.title.trim(),
      eventId: data.eventId,
      rewardPoints: data.rewardPoints,
      deadline: new Date(data.deadline),
      difficulty: data.difficulty,
      description: data.description.trim(),
      is_active: data.is_active ?? true,
      created_by: userId && isValidObjectId(userId) ? userId : null,
      updated_by: userId && isValidObjectId(userId) ? userId : null,
    });

    return this.getMissionById(mission._id.toString());
  }

  async getMissions(query: IMissionListQuery = {}): Promise<IMissionListResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = await this.buildListFilter(query);
    const sort = this.buildSort(query.sortBy || query.sort_by, query.sortOrder || query.sort_order);

    const [missions, total] = await Promise.all([
      Mission.find(filter)
        .populate('eventId', POPULATE_EVENT)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Mission.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      missions: missions.map((mission) => this.mapMission(mission)),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  async getMissionById(id: string): Promise<IMissionResponse> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const mission = await Mission.findById(id).populate('eventId', POPULATE_EVENT).lean();

    if (!mission) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Mission not found');
    }

    return this.mapMission(mission);
  }

  async updateMission(
    id: string,
    data: ICreateMissionRequest,
    userId?: string,
  ): Promise<IMissionResponse> {
    const mission = await this.findMissionById(id);
    await this.validateEligibleEvent(data.eventId);

    mission.title = data.title.trim();
    mission.eventId = new Types.ObjectId(data.eventId);
    mission.rewardPoints = data.rewardPoints;
    mission.deadline = new Date(data.deadline);
    mission.difficulty = data.difficulty;
    mission.description = data.description.trim();
    if (data.is_active !== undefined) {
      mission.is_active = data.is_active;
    }
    if (userId && isValidObjectId(userId)) {
      mission.updated_by = new Types.ObjectId(userId);
    }

    await mission.save();
    return this.getMissionById(id);
  }

  async deleteMission(id: string): Promise<void> {
    await this.findMissionById(id);
    await Mission.findByIdAndDelete(id);
  }

  private async findMissionById(id: string): Promise<IMissionDocument> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const mission = await Mission.findById(id);
    if (!mission) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Mission not found');
    }

    return mission;
  }

  private getSevenDayCutoff(): Date {
    return new Date(Date.now() - SEVEN_DAYS_MS);
  }

  /** Events whose eventDate falls in [now - 7 days, now] */
  private getEventDateWindow(): { from: Date; to: Date } {
    return {
      from: this.getSevenDayCutoff(),
      to: new Date(),
    };
  }

  private buildMissionEventDropdownFilter(
    query: IMissionEventDropdownQuery,
  ): Record<string, unknown> {
    const { from, to } = this.getEventDateWindow();
    const filter: Record<string, unknown> = {
      is_active: true,
      eventDate: { $gte: from, $lte: to },
    };

    const search = query.search?.trim();
    if (search) {
      filter.title = new RegExp(this.escapeRegex(search), 'i');
    }

    return filter;
  }

  private async validateEligibleEvent(eventId: string): Promise<void> {
    if (!isValidObjectId(eventId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid eventId');
    }

    const event = await Event.findById(eventId).select('_id is_active eventDate title').lean();
    if (!event) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Event not found');
    }

    if (!event.is_active) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only active events can be selected');
    }

    const { from, to } = this.getEventDateWindow();
    const eventDate = new Date(event.eventDate);

    if (eventDate < from || eventDate > to) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Only events with eventDate within the last 7 days (up to now) can be selected',
      );
    }
  }

  private async buildListFilter(query: IMissionListQuery): Promise<Record<string, unknown>> {
    const andConditions: Record<string, unknown>[] = [];

    if (query.difficulty) {
      andConditions.push({ difficulty: query.difficulty });
    }

    if (query.eventId && isValidObjectId(query.eventId)) {
      andConditions.push({ eventId: new Types.ObjectId(query.eventId) });
    }

    if (typeof query.is_active === 'boolean') {
      andConditions.push({ is_active: query.is_active });
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
      andConditions.push({ deadline: dateRange });
    }

    if (query.minRewardPoints !== undefined || query.maxRewardPoints !== undefined) {
      const pointsRange: Record<string, number> = {};
      if (query.minRewardPoints !== undefined) {
        pointsRange.$gte = query.minRewardPoints;
      }
      if (query.maxRewardPoints !== undefined) {
        pointsRange.$lte = query.maxRewardPoints;
      }
      andConditions.push({ rewardPoints: pointsRange });
    }

    const search = query.search?.trim();
    if (search) {
      const regex = new RegExp(this.escapeRegex(search), 'i');
      const matchingEvents = await Event.find({ title: regex }).select('_id').lean();
      const eventIds = matchingEvents.map((event) => event._id);

      andConditions.push({
        $or: [
          { title: regex },
          { description: regex },
          ...(eventIds.length > 0 ? [{ eventId: { $in: eventIds } }] : []),
        ],
      });
    }

    if (andConditions.length === 0) {
      return {};
    }
    if (andConditions.length === 1) {
      return andConditions[0];
    }
    return { $and: andConditions };
  }

  private buildSort(
    sortBy?: 'createdAt' | 'deadline' | 'rewardPoints' | 'title',
    sortOrder?: 'asc' | 'desc',
  ): Record<string, 1 | -1> {
    if (sortBy) {
      const direction = sortOrder === 'asc' ? 1 : -1;
      return { [sortBy]: direction };
    }

    return { createdAt: -1 };
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private mapMission(mission: Record<string, unknown>): IMissionResponse {
    const event = mission.eventId as
      | { _id: { toString(): string }; title?: string; eventDate?: Date }
      | Types.ObjectId
      | null
      | undefined;

    const eventMapped: IEventSummary | null =
      event && typeof event === 'object' && '_id' in event && 'title' in event
        ? {
            _id: (event as { _id: { toString(): string } })._id.toString(),
            title: (event as { title?: string }).title ?? '',
            eventDate: (event as { eventDate?: Date }).eventDate as Date,
          }
        : event
          ? {
              _id: (event as Types.ObjectId).toString(),
              title: '',
              eventDate: '',
            }
          : null;

    return {
      _id: (mission._id as { toString(): string }).toString(),
      title: mission.title as string,
      event: eventMapped,
      rewardPoints: mission.rewardPoints as number,
      deadline: mission.deadline as Date,
      difficulty: mission.difficulty as MissionDifficulty,
      description: mission.description as string,
      is_active: mission.is_active as boolean,
      created_by: mission.created_by
        ? (mission.created_by as { toString(): string }).toString()
        : null,
      updated_by: mission.updated_by
        ? (mission.updated_by as { toString(): string }).toString()
        : null,
      createdAt: mission.createdAt as Date | undefined,
      updatedAt: mission.updatedAt as Date | undefined,
    };
  }
}
