import mongoose from 'mongoose';
import { Event } from '../models/event.model';
import { EventCategory, IEventCategoryDocument } from '../models/eventcategory.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { isValidObjectId, getPaginationParams, buildPaginationMeta } from '../utils/helpers';
import { DEFAULT_EVENT_CATEGORIES } from '../constants/default-event-categories';

export interface ICreateCategoryRequest {
  name: string;
  icon: string;
  description?: string;
  color?: string;
  sort_order?: number;
}

export interface IUpdateCategoryRequest {
  name: string;
  icon: string;
  description?: string;
  color?: string;
  sort_order?: number;
}

export interface ICategoryListQuery {
  search?: string;
  page?: number;
  limit?: number;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ICategoryResponse {
  _id: string;
  name: string;
  icon: string;
  description?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
  created_by?: string | null;
  updated_by?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICategoryDropdownItem {
  _id: string;
  name: string;
  icon: string;
}

export interface ICategoryListResponse {
  categories: ICategoryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class EventCategoryService {
  async createCategory(data: ICreateCategoryRequest, userId?: string): Promise<ICategoryResponse> {
    const name = data.name.trim();
    await this.assertNameUnique(name);

    const category = await EventCategory.create({
      name,
      icon: data.icon.trim(),
      description: data.description?.trim() || '',
      color: data.color?.trim() || '',
      sort_order: data.sort_order ?? 0,
      is_active: true,
      created_by: userId && isValidObjectId(userId) ? userId : null,
      updated_by: userId && isValidObjectId(userId) ? userId : null,
    });

    return this.mapCategory(category);
  }

  async getCategories(query: ICategoryListQuery = {}): Promise<ICategoryListResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = this.buildListFilter(query);
    const sort = this.buildSort(query.sort_by, query.sort_order);

    const [categories, total] = await Promise.all([
      EventCategory.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      EventCategory.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      categories: categories.map((category) => this.mapCategory(category)),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  async getDropdown(): Promise<ICategoryDropdownItem[]> {
    const categories = await EventCategory.find({ is_active: true })
      .select('_id name icon')
      .sort({ sort_order: 1 })
      .lean();

    return categories.map((category) => ({
      _id: category._id.toString(),
      name: category.name,
      icon: category.icon,
    }));
  }

  async getCategoryById(id: string): Promise<ICategoryResponse> {
    const category = await this.findCategoryById(id);
    return this.mapCategory(category);
  }

  async updateCategory(
    id: string,
    data: IUpdateCategoryRequest,
    userId?: string,
  ): Promise<ICategoryResponse> {
    const category = await this.findCategoryById(id);
    const name = data.name.trim();

    await this.assertNameUnique(name, id);

    category.name = name;
    category.icon = data.icon.trim();
    category.description = data.description?.trim() || '';
    category.color = data.color?.trim() || '';
    if (data.sort_order !== undefined) {
      category.sort_order = data.sort_order;
    }
    if (userId && isValidObjectId(userId)) {
      category.updated_by = new mongoose.Types.ObjectId(userId);
    }

    await category.save();
    return this.mapCategory(category);
  }

  async updateCategoryStatus(
    id: string,
    isActive: boolean,
    userId?: string,
  ): Promise<{ is_active: boolean }> {
    const category = await this.findCategoryById(id);

    category.is_active = isActive;
    if (userId && isValidObjectId(userId)) {
      category.updated_by = new mongoose.Types.ObjectId(userId);
    }

    await category.save();
    return { is_active: category.is_active };
  }

  async deleteCategory(id: string): Promise<void> {
    await this.findCategoryById(id);

    const eventCount = await this.countEventsReferencingCategory(id);
    if (eventCount > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Category cannot be deleted because it is associated with one or more events',
      );
    }

    await EventCategory.findByIdAndDelete(id);
  }

  async seedDefaultCategories(): Promise<number> {
    let upserted = 0;

    for (const item of DEFAULT_EVENT_CATEGORIES) {
      const result = await EventCategory.updateOne(
        { name: item.name },
        {
          $setOnInsert: {
            name: item.name,
            icon: item.icon,
            sort_order: item.sort_order,
            description: '',
            color: '',
            is_active: true,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        upserted += 1;
      }
    }

    return upserted;
  }

  private async countEventsReferencingCategory(categoryId: string): Promise<number> {
    return Event.countDocuments({ categoryId });
  }

  private async findCategoryById(id: string): Promise<IEventCategoryDocument> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const category = await EventCategory.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }

    return category;
  }

  private async assertNameUnique(name: string, excludeId?: string): Promise<void> {
    const filter: Record<string, unknown> = {
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    };

    if (excludeId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const existing = await EventCategory.findOne(filter).select('_id').lean();
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Category name already exists');
    }
  }

  private buildListFilter(query: ICategoryListQuery): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    if (typeof query.is_active === 'boolean') {
      filter.is_active = query.is_active;
    }

    const search = query.search?.trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }

    return filter;
  }

  private buildSort(sortBy?: string, sortOrder?: 'asc' | 'desc'): Record<string, 1 | -1> {
    if (sortBy) {
      const direction = sortOrder === 'desc' ? -1 : 1;
      return { [sortBy]: direction };
    }

    return { sort_order: 1, createdAt: -1 };
  }

  private mapCategory(
    category:
      | IEventCategoryDocument
      | {
          _id: { toString(): string };
          name: string;
          icon: string;
          description?: string;
          color?: string;
          is_active: boolean;
          sort_order: number;
          created_by?: { toString(): string } | null;
          updated_by?: { toString(): string } | null;
          createdAt?: Date;
          updatedAt?: Date;
        },
  ): ICategoryResponse {
    return {
      _id: category._id.toString(),
      name: category.name,
      icon: category.icon,
      description: category.description,
      color: category.color,
      is_active: category.is_active,
      sort_order: category.sort_order,
      created_by: category.created_by?.toString() ?? null,
      updated_by: category.updated_by?.toString() ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
