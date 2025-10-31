# Service Layer Architecture

## Overview

This document describes the service layer architecture implemented in TaskBuddy Voice. The service layer provides a clean separation of concerns, improved testability, and better code organization.

---

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Components**: Handle UI and user interactions
- **Services**: Handle business logic and data operations
- **Hooks**: Connect components to services

### 2. **Dependency Injection**
- Services are injected via a container
- Easy to mock for testing
- Single source of truth for service instances

### 3. **Interface-Based Design**
- All services implement interfaces
- Enables easy swapping of implementations
- Improves testability

### 4. **Consistent Error Handling**
- All service methods return `ServiceResult<T>`
- Predictable error handling across the app
- No thrown exceptions in service layer

---

## 📁 File Structure

```
src/
├── services/
│   ├── types.ts                 # Service interfaces and types
│   ├── TaskService.ts           # Task CRUD operations
│   ├── AuthService.ts           # Authentication
│   ├── AnalyticsService.ts      # Analytics and reporting
│   ├── RealtimeService.ts       # Real-time subscriptions
│   ├── ServiceContainer.ts      # DI container
│   └── index.ts                 # Exports
├── hooks/
│   └── useServices.ts           # React hooks for services
```

---

## 🔧 Services

### 1. TaskService

**Purpose**: Handles all task-related operations

**Methods:**
- `getAll(filters?, sort?)` - Get all tasks with filtering and sorting
- `getById(id)` - Get a single task
- `create(input)` - Create a new task
- `update(id, input)` - Update an existing task
- `delete(id)` - Delete a task
- `deleteMany(ids)` - Delete multiple tasks
- `updateMany(ids, input)` - Update multiple tasks
- `toggleComplete(id)` - Toggle task completion
- `getByDateRange(start, end)` - Get tasks in date range

**Features:**
- ✅ Input validation
- ✅ User authentication checks
- ✅ Consistent error handling
- ✅ Batch operations support

**Example Usage:**
```typescript
import { useTaskService } from '@/services';

function MyComponent() {
  const taskService = useTaskService();

  const createTask = async () => {
    const result = await taskService.create({
      title: 'Buy groceries',
      priority: 'high',
      category: 'shopping',
    });

    if (result.success) {
      console.log('Task created:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };
}
```

---

### 2. AuthService

**Purpose**: Handles authentication and user management

**Methods:**
- `signUp(credentials)` - Register a new user
- `signIn(credentials)` - Sign in existing user
- `signOut()` - Sign out current user
- `getSession()` - Get current session
- `getUser()` - Get current user
- `onAuthStateChange(callback)` - Subscribe to auth changes

**Features:**
- ✅ Email validation
- ✅ Password validation
- ✅ Session management
- ✅ Auth state subscriptions

**Example Usage:**
```typescript
import { useAuthService } from '@/services';

function LoginForm() {
  const authService = useAuthService();

  const handleLogin = async (email: string, password: string) => {
    const result = await authService.signIn({ email, password });

    if (result.success) {
      console.log('Logged in:', result.data);
    } else {
      console.error('Login failed:', result.error);
    }
  };
}
```

---

### 3. AnalyticsService

**Purpose**: Handles analytics, statistics, and reporting

**Methods:**
- `getWeeklyStats(userId)` - Get weekly statistics
- `getStatsForDateRange(userId, start, end)` - Custom date range stats
- `getMostProductiveDay(userId)` - Find most productive day
- `getTopCategories(userId, limit?)` - Get top categories

**Features:**
- ✅ Automatic calculations
- ✅ Daily breakdown
- ✅ Completion rates
- ✅ Category analysis

**Example Usage:**
```typescript
import { useAnalyticsService } from '@/services';

function WeeklyDigest() {
  const analyticsService = useAnalyticsService();

  const loadStats = async (userId: string) => {
    const result = await analyticsService.getWeeklyStats(userId);

    if (result.success) {
      console.log('Stats:', result.data);
    }
  };
}
```

---

### 4. RealtimeService

**Purpose**: Handles real-time subscriptions for live updates

**Methods:**
- `subscribeToTasks(userId, callback)` - Subscribe to task changes
- `unsubscribeAll()` - Clean up all subscriptions

**Features:**
- ✅ Automatic channel management
- ✅ Event filtering
- ✅ Cleanup on unmount

**Example Usage:**
```typescript
import { useRealtimeService } from '@/services';
import { useEffect } from 'react';

function TaskList() {
  const realtimeService = useRealtimeService();

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToTasks(
      userId,
      (task) => {
        console.log('Task updated:', task);
        // Update UI
      }
    );

    return unsubscribe;
  }, [userId]);
}
```

---

## 🔌 Dependency Injection

### Service Container

The `ServiceContainer` manages all service instances using the Singleton pattern.

**Features:**
- ✅ Single instance per application
- ✅ Lazy initialization
- ✅ Automatic dependency resolution
- ✅ Easy to reset for testing

**Implementation:**
```typescript
// src/services/ServiceContainer.ts
export class ServiceContainer {
  private static instance: ServiceContainer | null = null;

  public readonly taskService: TaskService;
  public readonly authService: AuthService;
  public readonly analyticsService: AnalyticsService;
  public readonly realtimeService: RealtimeService;

  private constructor(supabase: SupabaseClient) {
    this.taskService = new TaskService(supabase);
    this.authService = new AuthService(supabase);
    this.analyticsService = new AnalyticsService(supabase);
    this.realtimeService = new RealtimeService(supabase);
  }

  public static getInstance(supabase: SupabaseClient): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer(supabase);
    }
    return ServiceContainer.instance;
  }
}
```

---

## 🎣 React Hooks

### useServices()

Get all services at once:

```typescript
import { useServices } from '@/services';

function MyComponent() {
  const { taskService, authService, analyticsService } = useServices();
  
  // Use services...
}
```

### Individual Service Hooks

Get specific services:

```typescript
import {
  useTaskService,
  useAuthService,
  useAnalyticsService,
  useRealtimeService,
} from '@/services';

function MyComponent() {
  const taskService = useTaskService();
  // Use taskService...
}
```

---

## 📊 ServiceResult Pattern

All service methods return a `ServiceResult<T>`:

```typescript
interface ServiceResult<T> {
  data: T | null;      // The result data (null if error)
  error: Error | null; // The error (null if success)
  success: boolean;    // Whether the operation succeeded
}
```

**Benefits:**
- ✅ Consistent error handling
- ✅ No thrown exceptions
- ✅ Type-safe results
- ✅ Easy to check success/failure

**Usage Pattern:**
```typescript
const result = await taskService.create(input);

if (result.success) {
  // Handle success
  console.log('Created:', result.data);
} else {
  // Handle error
  console.error('Error:', result.error?.message);
}
```

---

## 🧪 Testing Services

### Mocking Services

Services are easy to mock for testing:

```typescript
import { vi } from 'vitest';
import type { ITaskService } from '@/services/types';

const mockTaskService: ITaskService = {
  getAll: vi.fn().mockResolvedValue({
    data: [],
    error: null,
    success: true,
  }),
  create: vi.fn(),
  // ... other methods
};
```

### Testing with Services

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TaskService } from '@/services/TaskService';

describe('TaskService', () => {
  it('should create a task', async () => {
    const mockSupabase = createMockSupabase();
    const taskService = new TaskService(mockSupabase);

    const result = await taskService.create({
      title: 'Test task',
    });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Test task');
  });
});
```

---

## 🔄 Migration Guide

### Before (Direct Supabase Calls)

```typescript
function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error(error);
        return;
      }

      setTasks(data);
    };

    fetchTasks();
  }, [userId]);
}
```

### After (With Services)

```typescript
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const taskService = useTaskService();

  useEffect(() => {
    const fetchTasks = async () => {
      const result = await taskService.getAll();

      if (result.success) {
        setTasks(result.data);
      } else {
        console.error(result.error);
      }
    };

    fetchTasks();
  }, [taskService]);
}
```

**Benefits:**
- ✅ Cleaner code
- ✅ Easier to test
- ✅ Consistent error handling
- ✅ Business logic separated from UI

---

## 📈 Benefits

### 1. **Testability**
- Services can be easily mocked
- Unit tests don't need real database
- Integration tests can use test database

### 2. **Maintainability**
- Business logic in one place
- Easy to find and update
- Clear separation of concerns

### 3. **Reusability**
- Services can be used across components
- No code duplication
- Consistent behavior

### 4. **Type Safety**
- Full TypeScript support
- Interface-based design
- Compile-time error checking

### 5. **Error Handling**
- Consistent error pattern
- No uncaught exceptions
- Easy to handle errors in UI

---

## 🎯 Best Practices

### 1. **Always Check Success**
```typescript
const result = await taskService.create(input);

if (result.success) {
  // Handle success
} else {
  // Handle error
}
```

### 2. **Use Hooks in Components**
```typescript
// ✅ Good
function MyComponent() {
  const taskService = useTaskService();
  // ...
}

// ❌ Bad - Don't create services directly
function MyComponent() {
  const taskService = new TaskService(supabase);
  // ...
}
```

### 3. **Handle Errors Gracefully**
```typescript
const result = await taskService.create(input);

if (!result.success) {
  toast({
    title: 'Error',
    description: result.error?.message || 'Failed to create task',
    variant: 'destructive',
  });
  return;
}

// Continue with success case
```

### 4. **Use TypeScript Types**
```typescript
import type { Task, CreateTaskInput } from '@/services/types';

const input: CreateTaskInput = {
  title: 'My task',
  priority: 'high',
};
```

---

## 🚀 Next Steps

### Optional Improvements

1. **Caching Layer**
   - Add caching to reduce API calls
   - Implement cache invalidation

2. **Optimistic Updates**
   - Update UI before API response
   - Rollback on error

3. **Request Cancellation**
   - Cancel pending requests on unmount
   - Prevent race conditions

4. **Retry Logic**
   - Automatic retry on network errors
   - Exponential backoff

5. **Batch Operations**
   - Queue multiple operations
   - Execute in batches

---

## 📚 Resources

- [Dependency Injection in TypeScript](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

**Status:** ✅ COMPLETE
**Services:** 4 (Task, Auth, Analytics, Realtime)
**Methods:** 20+ service methods
**Quality:** Production-ready

