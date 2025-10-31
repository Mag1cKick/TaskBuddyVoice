/**
 * Task Service
 * 
 * Handles all task-related operations with proper error handling
 * and business logic separation.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ITaskService,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  SortOptions,
  ServiceResult,
} from './types';

export class TaskService implements ITaskService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all tasks with optional filtering and sorting
   */
  async getAll(
    filters?: TaskFilters,
    sort?: SortOptions
  ): Promise<ServiceResult<Task[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: new Error('User not authenticated'),
          success: false,
        };
      }

      let query = this.supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      // Apply filters
      if (filters) {
        if (filters.completed !== undefined) {
          query = query.eq('completed', filters.completed);
        }
        if (filters.priority) {
          query = query.eq('priority', filters.priority);
        }
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.due_date_from) {
          query = query.gte('due_date', filters.due_date_from);
        }
        if (filters.due_date_to) {
          query = query.lte('due_date', filters.due_date_to);
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        // Default sort: incomplete first, then by due date, then by created date
        query = query.order('completed', { ascending: true });
        query = query.order('due_date', { ascending: true, nullsFirst: false });
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: data as Task[],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Get a single task by ID
   */
  async getById(id: string): Promise<ServiceResult<Task>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: new Error('User not authenticated'),
          success: false,
        };
      }

      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: data as Task,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Create a new task
   */
  async create(input: CreateTaskInput): Promise<ServiceResult<Task>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: new Error('User not authenticated'),
          success: false,
        };
      }

      // Validate input
      if (!input.title || input.title.trim().length === 0) {
        return {
          data: null,
          error: new Error('Task title is required'),
          success: false,
        };
      }

      const taskData = {
        user_id: user.id,
        title: input.title.trim(),
        description: input.description?.trim(),
        priority: input.priority,
        category: input.category,
        due_date: input.due_date,
        due_time: input.due_time,
        completed: false,
      };

      const { data, error } = await this.supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: data as Task,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Update an existing task
   */
  async update(id: string, input: UpdateTaskInput): Promise<ServiceResult<Task>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: new Error('User not authenticated'),
          success: false,
        };
      }

      // Validate input
      if (input.title !== undefined && input.title.trim().length === 0) {
        return {
          data: null,
          error: new Error('Task title cannot be empty'),
          success: false,
        };
      }

      const updateData: Partial<Task> = {};
      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.description !== undefined) updateData.description = input.description?.trim();
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.completed !== undefined) updateData.completed = input.completed;
      if (input.due_date !== undefined) updateData.due_date = input.due_date;
      if (input.due_time !== undefined) updateData.due_time = input.due_time;

      const { data, error } = await this.supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: data as Task,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: new Error('User not authenticated'),
          success: false,
        };
      }

      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Delete multiple tasks
   */
  async deleteMany(ids: string[]): Promise<ServiceResult<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: new Error('User not authenticated'),
          success: false,
        };
      }

      if (ids.length === 0) {
        return {
          data: null,
          error: new Error('No task IDs provided'),
          success: false,
        };
      }

      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Update multiple tasks
   */
  async updateMany(ids: string[], input: UpdateTaskInput): Promise<ServiceResult<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: new Error('User not authenticated'),
          success: false,
        };
      }

      if (ids.length === 0) {
        return {
          data: null,
          error: new Error('No task IDs provided'),
          success: false,
        };
      }

      const updateData: Partial<Task> = {};
      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.description !== undefined) updateData.description = input.description?.trim();
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.completed !== undefined) updateData.completed = input.completed;
      if (input.due_date !== undefined) updateData.due_date = input.due_date;
      if (input.due_time !== undefined) updateData.due_time = input.due_time;

      const { error } = await this.supabase
        .from('tasks')
        .update(updateData)
        .in('id', ids)
        .eq('user_id', user.id);

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Toggle task completion status
   */
  async toggleComplete(id: string): Promise<ServiceResult<Task>> {
    try {
      // First, get the current task
      const getResult = await this.getById(id);
      
      if (!getResult.success || !getResult.data) {
        return getResult;
      }

      // Toggle the completed status
      return this.update(id, { completed: !getResult.data.completed });
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Get tasks within a date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ServiceResult<Task[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: new Error('User not authenticated'),
          success: false,
        };
      }

      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      return {
        data: data as Task[],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }
}

