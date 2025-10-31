/**
 * Service Layer Types and Interfaces
 * 
 * This file defines the contracts for all services in the application.
 * Using interfaces allows for easy mocking and testing.
 */

import type { User, Session } from '@supabase/supabase-js';

// ============================================
// Common Types
// ============================================

export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  completed: boolean;
  due_date?: string;
  due_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date?: string;
  due_time?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  completed?: boolean;
  due_date?: string;
  due_time?: string;
}

export interface TaskFilters {
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date_from?: string;
  due_date_to?: string;
}

// ============================================
// Analytics Types
// ============================================

export interface WeeklyStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  high_priority_tasks: number;
  medium_priority_tasks: number;
  low_priority_tasks: number;
  categories_used: string[];
  completion_rate: number;
  daily_breakdown: DailyBreakdown[];
}

export interface DailyBreakdown {
  date: string;
  day_name: string;
  task_count: number;
  completed_count: number;
}

// ============================================
// Auth Types
// ============================================

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// ============================================
// Service Interfaces
// ============================================

/**
 * Task Service Interface
 * Handles all task-related operations
 */
export interface ITaskService {
  // CRUD Operations
  getAll(filters?: TaskFilters, sort?: SortOptions): Promise<ServiceResult<Task[]>>;
  getById(id: string): Promise<ServiceResult<Task>>;
  create(input: CreateTaskInput): Promise<ServiceResult<Task>>;
  update(id: string, input: UpdateTaskInput): Promise<ServiceResult<Task>>;
  delete(id: string): Promise<ServiceResult<void>>;
  
  // Batch Operations
  deleteMany(ids: string[]): Promise<ServiceResult<void>>;
  updateMany(ids: string[], input: UpdateTaskInput): Promise<ServiceResult<void>>;
  
  // Special Operations
  toggleComplete(id: string): Promise<ServiceResult<Task>>;
  getByDateRange(startDate: string, endDate: string): Promise<ServiceResult<Task[]>>;
}

/**
 * Auth Service Interface
 * Handles authentication and user management
 */
export interface IAuthService {
  // Authentication
  signUp(credentials: SignUpCredentials): Promise<ServiceResult<User>>;
  signIn(credentials: SignInCredentials): Promise<ServiceResult<User>>;
  signOut(): Promise<ServiceResult<void>>;
  
  // Session Management
  getSession(): Promise<ServiceResult<Session>>;
  getUser(): Promise<ServiceResult<User>>;
  
  // Auth State
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}

/**
 * Analytics Service Interface
 * Handles analytics and reporting
 */
export interface IAnalyticsService {
  // Weekly Stats
  getWeeklyStats(userId: string): Promise<ServiceResult<WeeklyStats>>;
  
  // Custom Date Range
  getStatsForDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ServiceResult<WeeklyStats>>;
  
  // Insights
  getMostProductiveDay(userId: string): Promise<ServiceResult<string>>;
  getTopCategories(userId: string, limit?: number): Promise<ServiceResult<string[]>>;
}

/**
 * Realtime Service Interface
 * Handles real-time subscriptions
 */
export interface IRealtimeService {
  // Task Subscriptions
  subscribeToTasks(
    userId: string,
    callback: (task: Task) => void
  ): () => void;
  
  // Cleanup
  unsubscribeAll(): void;
}

// ============================================
// Service Container Interface
// ============================================

export interface IServiceContainer {
  taskService: ITaskService;
  authService: IAuthService;
  analyticsService: IAnalyticsService;
  realtimeService: IRealtimeService;
}

