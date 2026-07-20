import { User } from '../models/user.model';
import { ROLES } from '../constants/roles';
import { getPaginationParams, buildPaginationMeta } from '../utils/helpers';

export interface IGovernmentDropdownQuery {
  search?: string;
  page?: number;
  limit?: number;
  city?: string;
  department?: string;
  state?: string;
  is_active?: boolean;
}

export interface IGovernmentDropdownItem {
  _id: string;
  organization_name: string;
}

export interface IGovernmentDropdownResponse {
  organizations: IGovernmentDropdownItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ISchoolListQuery {
  search?: string;
  page?: number;
  limit?: number;
  city?: string;
  state?: string;
  is_active?: boolean;
}

export interface ISchoolListItem {
  _id: string;
  school_name: string;
  email: string;
  city?: string;
  state?: string;
}

export interface ISchoolListResponse {
  schools: ISchoolListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class GovernmentService {
  /**
   * Paginated government organization dropdown.
   * Defaults to active organizations unless is_active is explicitly provided.
   */
  async getDropdown(query: IGovernmentDropdownQuery = {}): Promise<IGovernmentDropdownResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = this.buildDropdownFilter(query);

    const [organizations, total] = await Promise.all([
      User.find(filter)
        .select('_id profile.organizationName fullName')
        .sort({ 'profile.organizationName': 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      organizations: organizations.map((org) => ({
        _id: org._id.toString(),
        organization_name: org.profile?.organizationName || org.fullName || '',
      })),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  /**
   * Paginated schools list for government users.
   * Defaults to active schools unless is_active is explicitly provided.
   */
  async getSchools(query: ISchoolListQuery = {}): Promise<ISchoolListResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = this.buildSchoolListFilter(query);

    const [schools, total] = await Promise.all([
      User.find(filter)
        .select('_id fullName email profile.institutionName profile.city profile.state')
        .sort({ 'profile.institutionName': 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      schools: schools.map((school) => ({
        _id: school._id.toString(),
        school_name: school.profile?.institutionName || school.fullName || '',
        email: school.email,
        city: school.profile?.city,
        state: school.profile?.state,
      })),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  private buildDropdownFilter(query: IGovernmentDropdownQuery): Record<string, unknown> {
    const filter: Record<string, unknown> = { role: ROLES.GOVERNMENT };

    // Default: only active unless is_active explicitly provided
    if (typeof query.is_active === 'boolean') {
      filter.status = query.is_active ? 'active' : { $ne: 'active' };
    } else {
      filter.status = 'active';
    }

    if (query.city?.trim()) {
      filter['profile.city'] = new RegExp(this.escapeRegex(query.city.trim()), 'i');
    }

    if (query.department?.trim()) {
      filter['profile.department'] = new RegExp(this.escapeRegex(query.department.trim()), 'i');
    }

    if (query.state?.trim()) {
      filter['profile.state'] = new RegExp(this.escapeRegex(query.state.trim()), 'i');
    }

    const search = query.search?.trim();
    if (search) {
      const regex = new RegExp(this.escapeRegex(search), 'i');
      filter.$or = [
        { 'profile.organizationName': regex },
        { 'profile.department': regex },
        { 'profile.city': regex },
        { fullName: regex },
      ];
    }

    return filter;
  }

  private buildSchoolListFilter(query: ISchoolListQuery): Record<string, unknown> {
    const filter: Record<string, unknown> = { role: ROLES.SCHOOL };

    if (typeof query.is_active === 'boolean') {
      filter.status = query.is_active ? 'active' : { $ne: 'active' };
    } else {
      filter.status = 'active';
    }

    if (query.city?.trim()) {
      filter['profile.city'] = new RegExp(this.escapeRegex(query.city.trim()), 'i');
    }

    if (query.state?.trim()) {
      filter['profile.state'] = new RegExp(this.escapeRegex(query.state.trim()), 'i');
    }

    const search = query.search?.trim();
    if (search) {
      const regex = new RegExp(this.escapeRegex(search), 'i');
      filter.$or = [
        { 'profile.institutionName': regex },
        { fullName: regex },
        { email: regex },
        { 'profile.city': regex },
      ];
    }

    return filter;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
