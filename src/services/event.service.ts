import { Types } from 'mongoose';
import { Event, IEventDocument, EventType, EventStatus } from '../models/event.model';
import { EventCategory } from '../models/eventcategory.model';
import { User } from '../models/user.model';
import { EventParticipant, AttendanceStatus } from '../models/eventParticipant.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { isValidObjectId, getPaginationParams, buildPaginationMeta } from '../utils/helpers';
import { ROLES } from '../constants/roles';

export interface ICreateEventRequest {
  title: string;
  description: string;
  categoryId: string;
  city: string;
  eventDate: string | Date;
  eventType: EventType;
  schoolIds?: string[];
  governmentIds?: string[];
  is_active?: boolean;
}

export interface IEventListQuery {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  city?: string;
  eventDate?: string | Date;
  fromDate?: string | Date;
  toDate?: string | Date;
  schoolId?: string;
  governmentId?: string;
  eventType?: EventType;
  is_active?: boolean;
  sort_by?: 'eventDate' | 'createdAt' | 'title';
  sortBy?: 'eventDate' | 'createdAt' | 'title';
  sort_order?: 'asc' | 'desc';
  sortOrder?: 'asc' | 'desc';
}

export type EventVisibilityScope =
  | { type: 'admin' }
  | { type: 'school'; schoolUserId: string }
  | { type: 'government'; governmentUserId: string }
  | { type: 'student'; schoolId: string };

export interface ISchoolSummary {
  _id: string;
  name: string;
  email?: string;
  school_name?: string;
}

export interface IGovernmentSummary {
  _id: string;
  name: string;
  email?: string;
  organization_name?: string;
}

export interface ICategorySummary {
  _id: string;
  name: string;
  icon?: string;
}

export interface IEventResponse {
  _id: string;
  title: string;
  description: string;
  city: string;
  eventDate: Date | string;
  eventType: EventType;
  is_active: boolean;
  category: ICategorySummary | null;
  schools: ISchoolSummary[];
  governmentOrganizations: IGovernmentSummary[];
  categoryId?: string;
  schoolIds?: string[];
  governmentIds?: string[];
  created_by?: string | null;
  updated_by?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IEventListResponse {
  events: IEventResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IStudentEventResponse {
  eventId: string;
  title: string;
  description: string;
  eventDate: Date | string;
  city: string;
  status: EventStatus;
  totalParticipants: number;
}

export interface IJoinedEventResponse {
  event: {
    _id: string;
    title: string;
    description: string;
    eventDate: Date | string;
    city: string;
    status: EventStatus;
    totalParticipants: number;
  } | null;
  joinedAt: Date | string;
  attendanceStatus: AttendanceStatus;
}

const uniqueObjectIds = (ids: string[] = []): Types.ObjectId[] => {
  const unique = [...new Set(ids.filter(Boolean).map((id) => id.trim()))];
  return unique.map((id) => new Types.ObjectId(id));
};

const POPULATE_CATEGORY = '_id name icon';
const POPULATE_SCHOOL = '_id fullName email profile.institutionName';
const POPULATE_GOVERNMENT = '_id fullName email profile.organizationName';

export class EventService {
  async createEvent(data: ICreateEventRequest, userId?: string): Promise<IEventResponse> {
    const schoolIds = uniqueObjectIds(data.schoolIds);
    const governmentIds = uniqueObjectIds(data.governmentIds);

    await this.validateReferences(data.categoryId, schoolIds, governmentIds);

    const event = await Event.create({
      title: data.title.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      city: data.city.trim(),
      eventDate: new Date(data.eventDate),
      eventType: data.eventType,
      schoolIds,
      governmentIds,
      is_active: data.is_active ?? true,
      created_by: userId && isValidObjectId(userId) ? userId : null,
      updated_by: userId && isValidObjectId(userId) ? userId : null,
    });

    return this.getEventById(event._id.toString());
  }

  async getEvents(query: IEventListQuery = {}): Promise<IEventListResponse> {
    return this.listEvents(query, { type: 'admin' });
  }

  async getEventsForSchool(
    schoolUserId: string,
    query: IEventListQuery = {},
  ): Promise<IEventListResponse> {
    if (!schoolUserId || !isValidObjectId(schoolUserId)) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
    }
    return this.listEvents(query, { type: 'school', schoolUserId });
  }

  async getEventsForGovernment(
    governmentUserId: string,
    query: IEventListQuery = {},
  ): Promise<IEventListResponse> {
    if (!governmentUserId || !isValidObjectId(governmentUserId)) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
    }
    return this.listEvents(query, { type: 'government', governmentUserId });
  }

  async getEventsForStudent(
    studentUserId: string,
    query: IEventListQuery = {},
  ): Promise<IEventListResponse> {
    const { schoolId } = await this.resolveStudent(studentUserId);
    return this.listEvents(query, { type: 'student', schoolId });
  }

  /**
   * API 1 — Upcoming/ongoing events for the logged-in student's school.
   * Automatically scoped to the student's school and sorted by nearest event date.
   */
  async getStudentEvents(studentUserId: string): Promise<IStudentEventResponse[]> {
    const { schoolId } = await this.resolveStudent(studentUserId);

    const visibility = this.buildVisibilityFilter({ type: 'student', schoolId });
    const filter: Record<string, unknown> = {
      ...(visibility ?? {}),
      is_active: true,
      status: { $in: ['upcoming', 'ongoing'] as EventStatus[] },
    };

    const events = await Event.find(filter)
      .select('_id title description eventDate city status totalParticipants')
      .sort({ eventDate: 1 })
      .lean();

    return events.map((event) => ({
      eventId: (event._id as { toString(): string }).toString(),
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      city: event.city,
      status: event.status as EventStatus,
      totalParticipants: (event.totalParticipants as number) ?? 0,
    }));
  }

  /**
   * API 2 — Register the logged-in student for an event of their school.
   */
  async joinEvent(studentUserId: string, eventId: string): Promise<void> {
    const student = await this.resolveStudent(studentUserId);
    const event = await this.findEventById(eventId);

    this.assertEventBelongsToSchool(event, student.schoolId);

    if (event.status === 'completed' || event.status === 'cancelled') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Event has been ${event.status} and can no longer be joined`,
      );
    }

    await this.assertNotAlreadyJoined(event._id.toString(), student._id);

    if (event.maxParticipants > 0 && event.totalParticipants >= event.maxParticipants) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Maximum participants reached for this event');
    }

    try {
      await EventParticipant.create({
        eventId: event._id,
        studentId: student._id,
        studentName: student.fullName,
        schoolId: student.schoolId ? new Types.ObjectId(student.schoolId) : null,
        joinedAt: new Date(),
        attendanceStatus: 'registered',
      });
    } catch (error) {
      // Guard against a race hitting the unique (eventId, studentId) index.
      if ((error as { code?: number }).code === 11000) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'You have already joined this event');
      }
      throw error;
    }

    await Event.updateOne({ _id: event._id }, { $inc: { totalParticipants: 1 } });
  }

  /**
   * API 3 — All events joined by the logged-in student with attendance details.
   */
  async getMyJoinedEvents(studentUserId: string): Promise<IJoinedEventResponse[]> {
    const student = await this.resolveStudent(studentUserId);

    const participations = await EventParticipant.find({ studentId: student._id })
      .populate('eventId', '_id title description eventDate city status totalParticipants')
      .sort({ joinedAt: -1 })
      .lean();

    return participations.map((participation) => this.mapJoinedEvent(participation));
  }

  private async listEvents(
    query: IEventListQuery,
    scope: EventVisibilityScope,
  ): Promise<IEventListResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = await this.buildListFilter(query, scope);
    const sort = this.buildSort(query.sortBy || query.sort_by, query.sortOrder || query.sort_order);

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('categoryId', POPULATE_CATEGORY)
        .populate('schoolIds', POPULATE_SCHOOL)
        .populate('governmentIds', POPULATE_GOVERNMENT)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      events: events.map((event) => this.mapEvent(event)),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  async getEventById(id: string): Promise<IEventResponse> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const event = await Event.findById(id)
      .populate('categoryId', POPULATE_CATEGORY)
      .populate('schoolIds', POPULATE_SCHOOL)
      .populate('governmentIds', POPULATE_GOVERNMENT)
      .lean();

    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    return this.mapEvent(event);
  }

  async updateEvent(
    id: string,
    data: ICreateEventRequest,
    userId?: string,
  ): Promise<IEventResponse> {
    const event = await this.findEventById(id);
    const schoolIds = uniqueObjectIds(data.schoolIds);
    const governmentIds = uniqueObjectIds(data.governmentIds);

    await this.validateReferences(data.categoryId, schoolIds, governmentIds);

    event.title = data.title.trim();
    event.description = data.description.trim();
    event.categoryId = new Types.ObjectId(data.categoryId);
    event.city = data.city.trim();
    event.eventDate = new Date(data.eventDate);
    event.eventType = data.eventType;
    event.schoolIds = schoolIds;
    event.governmentIds = governmentIds;
    if (data.is_active !== undefined) {
      event.is_active = data.is_active;
    }
    if (userId && isValidObjectId(userId)) {
      event.updated_by = new Types.ObjectId(userId);
    }

    await event.save();
    return this.getEventById(id);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.findEventById(id);
    await Event.findByIdAndDelete(id);
  }

  private async findEventById(id: string): Promise<IEventDocument> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const event = await Event.findById(id);
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    return event;
  }

  private async resolveStudent(
    studentUserId: string,
  ): Promise<{ _id: Types.ObjectId; fullName: string; schoolId: string }> {
    if (!studentUserId || !isValidObjectId(studentUserId)) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
    }

    const student = await User.findById(studentUserId).select('_id fullName role schoolId').lean();
    if (!student || student.role !== ROLES.STUDENT) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Student access only');
    }
    if (!student.schoolId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Student is not linked to a school');
    }

    return {
      _id: student._id,
      fullName: student.fullName,
      schoolId: student.schoolId.toString(),
    };
  }

  private assertEventBelongsToSchool(event: IEventDocument, schoolId: string): void {
    const belongsToSchool =
      event.eventType === 'public' || event.schoolIds.some((id) => id.toString() === schoolId);

    if (!belongsToSchool) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'This event does not belong to your school');
    }
  }

  private async assertNotAlreadyJoined(eventId: string, studentId: Types.ObjectId): Promise<void> {
    const existing = await EventParticipant.findOne({
      eventId: new Types.ObjectId(eventId),
      studentId,
    })
      .select('_id')
      .lean();

    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'You have already joined this event');
    }
  }

  private mapJoinedEvent(participation: Record<string, unknown>): IJoinedEventResponse {
    const event = participation.eventId as
      | Record<string, unknown>
      | Types.ObjectId
      | null
      | undefined;

    let mappedEvent: IJoinedEventResponse['event'] = null;
    if (event && typeof event === 'object' && '_id' in event && 'title' in event) {
      mappedEvent = {
        _id: (event._id as { toString(): string }).toString(),
        title: event.title as string,
        description: event.description as string,
        eventDate: event.eventDate as Date,
        city: event.city as string,
        status: event.status as EventStatus,
        totalParticipants: (event.totalParticipants as number) ?? 0,
      };
    }

    return {
      event: mappedEvent,
      joinedAt: participation.joinedAt as Date,
      attendanceStatus: participation.attendanceStatus as AttendanceStatus,
    };
  }

  private async validateReferences(
    categoryId: string,
    schoolIds: Types.ObjectId[],
    governmentIds: Types.ObjectId[],
  ): Promise<void> {
    if (!isValidObjectId(categoryId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid categoryId');
    }

    const category = await EventCategory.findById(categoryId).select('_id is_active').lean();
    if (!category) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Category not found');
    }

    if (schoolIds.length > 0) {
      const schools = await User.find({
        _id: { $in: schoolIds },
        role: ROLES.SCHOOL,
      })
        .select('_id')
        .lean();

      if (schools.length !== schoolIds.length) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'One or more schoolIds are invalid');
      }
    }

    if (governmentIds.length > 0) {
      const governments = await User.find({
        _id: { $in: governmentIds },
        role: ROLES.GOVERNMENT,
      })
        .select('_id')
        .lean();

      if (governments.length !== governmentIds.length) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'One or more governmentIds are invalid');
      }
    }
  }

  private buildVisibilityFilter(scope: EventVisibilityScope): Record<string, unknown> | null {
    if (scope.type === 'admin') {
      return null;
    }

    if (scope.type === 'school') {
      const schoolId = new Types.ObjectId(scope.schoolUserId);
      return {
        $or: [{ eventType: 'public' }, { eventType: 'private', schoolIds: schoolId }],
      };
    }

    if (scope.type === 'government') {
      const governmentId = new Types.ObjectId(scope.governmentUserId);
      return {
        $or: [{ eventType: 'public' }, { eventType: 'private', governmentIds: governmentId }],
      };
    }

    const schoolId = new Types.ObjectId(scope.schoolId);
    return {
      $or: [{ eventType: 'public' }, { eventType: 'private', schoolIds: schoolId }],
    };
  }

  private async buildListFilter(
    query: IEventListQuery,
    scope: EventVisibilityScope = { type: 'admin' },
  ): Promise<Record<string, unknown>> {
    const andConditions: Record<string, unknown>[] = [];

    const visibility = this.buildVisibilityFilter(scope);
    if (visibility) {
      andConditions.push(visibility);
    }

    // Active events for role-based listings; admin can still filter freely
    if (scope.type !== 'admin') {
      andConditions.push({ is_active: true });
    } else if (typeof query.is_active === 'boolean') {
      andConditions.push({ is_active: query.is_active });
    }

    if (query.categoryId && isValidObjectId(query.categoryId)) {
      andConditions.push({ categoryId: new Types.ObjectId(query.categoryId) });
    }

    if (query.city?.trim()) {
      andConditions.push({ city: new RegExp(this.escapeRegex(query.city.trim()), 'i') });
    }

    if (query.eventDate) {
      const day = new Date(query.eventDate);
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      andConditions.push({ eventDate: { $gte: start, $lte: end } });
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
      andConditions.push({ eventDate: dateRange });
    }

    if (query.schoolId && isValidObjectId(query.schoolId) && scope.type === 'admin') {
      andConditions.push({ schoolIds: new Types.ObjectId(query.schoolId) });
    }

    if (query.governmentId && isValidObjectId(query.governmentId) && scope.type === 'admin') {
      andConditions.push({ governmentIds: new Types.ObjectId(query.governmentId) });
    }

    if (query.eventType) {
      if (scope.type === 'admin') {
        andConditions.push({ eventType: query.eventType });
      } else if (query.eventType === 'public') {
        andConditions.push({ eventType: 'public' });
      } else if (query.eventType === 'private') {
        if (scope.type === 'school') {
          andConditions.push({
            eventType: 'private',
            schoolIds: new Types.ObjectId(scope.schoolUserId),
          });
        } else if (scope.type === 'government') {
          andConditions.push({
            eventType: 'private',
            governmentIds: new Types.ObjectId(scope.governmentUserId),
          });
        } else {
          andConditions.push({
            eventType: 'private',
            schoolIds: new Types.ObjectId(scope.schoolId),
          });
        }
      }
    }

    const search = query.search?.trim();
    if (search) {
      const regex = new RegExp(this.escapeRegex(search), 'i');
      andConditions.push({
        $or: [{ title: regex }, { description: regex }, { city: regex }],
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
    sortBy?: 'eventDate' | 'createdAt' | 'title',
    sortOrder?: 'asc' | 'desc',
  ): Record<string, 1 | -1> {
    if (sortBy) {
      const direction = sortOrder === 'desc' ? -1 : 1;
      return { [sortBy]: direction };
    }

    // Default: eventDate ASC, createdAt DESC
    return { eventDate: 1, createdAt: -1 };
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private mapEvent(event: Record<string, unknown>): IEventResponse {
    const category = event.categoryId as
      | { _id: { toString(): string }; name?: string; icon?: string }
      | Types.ObjectId
      | null
      | undefined;

    const schools = (event.schoolIds as Array<Record<string, unknown>> | undefined) ?? [];
    const governments = (event.governmentIds as Array<Record<string, unknown>> | undefined) ?? [];

    const categoryMapped: ICategorySummary | null =
      category && typeof category === 'object' && '_id' in category && 'name' in category
        ? {
            _id: (category as { _id: { toString(): string } })._id.toString(),
            name: (category as { name?: string }).name ?? '',
            icon: (category as { icon?: string }).icon,
          }
        : category
          ? {
              _id: (category as Types.ObjectId).toString(),
              name: '',
            }
          : null;

    return {
      _id: (event._id as { toString(): string }).toString(),
      title: event.title as string,
      description: event.description as string,
      city: event.city as string,
      eventDate: event.eventDate as Date,
      eventType: event.eventType as EventType,
      is_active: event.is_active as boolean,
      category: categoryMapped,
      schools: schools.map((school) => {
        const profile = school.profile as { institutionName?: string } | undefined;
        const name = profile?.institutionName || (school.fullName as string) || '';
        return {
          _id: (school._id as { toString(): string }).toString(),
          name,
          school_name: name,
          email: school.email as string | undefined,
        };
      }),
      governmentOrganizations: governments.map((gov) => {
        const profile = gov.profile as { organizationName?: string } | undefined;
        const name = profile?.organizationName || (gov.fullName as string) || '';
        return {
          _id: (gov._id as { toString(): string }).toString(),
          name,
          organization_name: name,
          email: gov.email as string | undefined,
        };
      }),
      created_by: event.created_by ? (event.created_by as { toString(): string }).toString() : null,
      updated_by: event.updated_by ? (event.updated_by as { toString(): string }).toString() : null,
      createdAt: event.createdAt as Date | undefined,
      updatedAt: event.updatedAt as Date | undefined,
    };
  }
}
