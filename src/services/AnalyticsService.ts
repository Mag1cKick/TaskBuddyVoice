/**
 * Analytics Service
 * 
 * Handles analytics, statistics, and reporting.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IAnalyticsService,
  WeeklyStats,
  DailyBreakdown,
  ServiceResult,
  Task,
} from './types';

export class AnalyticsService implements IAnalyticsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get weekly statistics for a user
   */
  async getWeeklyStats(userId: string): Promise<ServiceResult<WeeklyStats>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      return this.getStatsForDateRange(
        userId,
        startDate.toISOString(),
        endDate.toISOString()
      );
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        success: false,
      };
    }
  }

  /**
   * Get statistics for a custom date range
   */
  async getStatsForDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ServiceResult<WeeklyStats>> {
    try {
      // Fetch tasks from the date range
      const { data: tasks, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {
        return {
          data: null,
          error: new Error(error.message),
          success: false,
        };
      }

      // Calculate statistics
      const stats = this.calculateStats(tasks as Task[]);

      return {
        data: stats,
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
   * Get the most productive day for a user
   */
  async getMostProductiveDay(userId: string): Promise<ServiceResult<string>> {
    try {
      const statsResult = await this.getWeeklyStats(userId);

      if (!statsResult.success || !statsResult.data) {
        return {
          data: null,
          error: statsResult.error || new Error('Failed to get stats'),
          success: false,
        };
      }

      const { daily_breakdown } = statsResult.data;

      if (daily_breakdown.length === 0) {
        return {
          data: null,
          error: new Error('No data available'),
          success: false,
        };
      }

      // Find day with most completed tasks
      const mostProductiveDay = daily_breakdown.reduce((max, day) =>
        day.completed_count > max.completed_count ? day : max
      );

      return {
        data: mostProductiveDay.day_name,
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
   * Get top categories by task count
   */
  async getTopCategories(
    userId: string,
    limit: number = 5
  ): Promise<ServiceResult<string[]>> {
    try {
      const statsResult = await this.getWeeklyStats(userId);

      if (!statsResult.success || !statsResult.data) {
        return {
          data: null,
          error: statsResult.error || new Error('Failed to get stats'),
          success: false,
        };
      }

      const { categories_used } = statsResult.data;

      // For now, just return the categories
      // In a more advanced implementation, we'd count tasks per category
      const topCategories = categories_used.slice(0, limit);

      return {
        data: topCategories,
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
   * Calculate statistics from tasks
   * Private helper method
   */
  private calculateStats(tasks: Task[]): WeeklyStats {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;

    const categories = tasks
      .filter(task => task.category)
      .map(task => task.category as string);
    const categoriesUsed = [...new Set(categories)];

    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Calculate daily breakdown
    const dailyMap: { [key: string]: DailyBreakdown } = {};

    tasks.forEach(task => {
      const taskDate = new Date(task.created_at);
      const dateKey = taskDate.toISOString().split('T')[0];
      const dayName = taskDate.toLocaleDateString('en-US', { weekday: 'long' });

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: dateKey,
          day_name: dayName,
          task_count: 0,
          completed_count: 0,
        };
      }

      dailyMap[dateKey].task_count++;
      if (task.completed) {
        dailyMap[dateKey].completed_count++;
      }
    });

    const dailyBreakdown = Object.values(dailyMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      pending_tasks: pendingTasks,
      high_priority_tasks: highPriorityTasks,
      medium_priority_tasks: mediumPriorityTasks,
      low_priority_tasks: lowPriorityTasks,
      categories_used: categoriesUsed,
      completion_rate: completionRate,
      daily_breakdown: dailyBreakdown,
    };
  }
}

