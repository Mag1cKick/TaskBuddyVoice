/**
 * Service Container
 * 
 * Dependency Injection container that manages service instances.
 * This implements the Singleton pattern to ensure services are reused.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IServiceContainer } from './types';
import { TaskService } from './TaskService';
import { AuthService } from './AuthService';
import { AnalyticsService } from './AnalyticsService';
import { RealtimeService } from './RealtimeService';

export class ServiceContainer implements IServiceContainer {
  private static instance: ServiceContainer | null = null;

  public readonly taskService: TaskService;
  public readonly authService: AuthService;
  public readonly analyticsService: AnalyticsService;
  public readonly realtimeService: RealtimeService;

  private constructor(supabase: SupabaseClient) {
    // Initialize all services with the Supabase client
    this.taskService = new TaskService(supabase);
    this.authService = new AuthService(supabase);
    this.analyticsService = new AnalyticsService(supabase);
    this.realtimeService = new RealtimeService(supabase);
  }

  /**
   * Get or create the singleton instance
   */
  public static getInstance(supabase: SupabaseClient): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer(supabase);
    }
    return ServiceContainer.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (ServiceContainer.instance) {
      // Cleanup realtime subscriptions
      ServiceContainer.instance.realtimeService.unsubscribeAll();
      ServiceContainer.instance = null;
    }
  }
}

/**
 * Factory function to create service container
 * This is the recommended way to get services
 */
export function createServiceContainer(supabase: SupabaseClient): IServiceContainer {
  return ServiceContainer.getInstance(supabase);
}

