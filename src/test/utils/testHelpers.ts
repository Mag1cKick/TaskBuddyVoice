import { vi } from 'vitest'
import type { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Mock Supabase client for testing
 */
export function createMockSupabaseClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  }
}

/**
 * Create mock task data
 */
export function createMockTask(overrides = {}) {
  return {
    id: Math.random().toString(36).substring(7),
    title: 'Test Task',
    completed: false,
    priority: undefined,
    category: undefined,
    due_date: undefined,
    due_time: undefined,
    description: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'test-user',
    ...overrides,
  }
}

/**
 * Create multiple mock tasks
 */
export function createMockTasks(count: number, baseOverrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      ...baseOverrides,
      id: `task-${i}`,
      title: `Test Task ${i + 1}`,
    })
  )
}

/**
 * Create mock user
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create mock session
 */
export function createMockSession(userOverrides = {}) {
  return {
    user: createMockUser(userOverrides),
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Date.now() + 3600000,
  }
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock console methods to suppress errors/warnings in tests
 */
export function suppressConsoleLogs() {
  const originalError = console.error
  const originalWarn = console.warn

  beforeAll(() => {
    console.error = vi.fn()
    console.warn = vi.fn()
  })

  afterAll(() => {
    console.error = originalError
    console.warn = originalWarn
  })
}

/**
 * Create a mock date that's relative to now
 */
export function createRelativeDate(daysOffset: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

/**
 * Create a mock time string
 */
export function createMockTime(hours: number, minutes: number = 0) {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Assert that a function throws an error with specific message
 */
export async function expectThrowsAsync(fn: () => Promise<any>, errorMessage?: string) {
  let error: Error | undefined

  try {
    await fn()
  } catch (e) {
    error = e as Error
  }

  if (!error) {
    throw new Error('Expected function to throw an error')
  }

  if (errorMessage && !error.message.includes(errorMessage)) {
    throw new Error(`Expected error message to include "${errorMessage}", but got "${error.message}"`)
  }

  return error
}

/**
 * Create mock voice recognition result
 */
export function createMockVoiceResult(transcript: string) {
  return {
    results: [
      [
        {
          transcript,
          confidence: 0.9,
        },
      ],
    ],
    resultIndex: 0,
  }
}

/**
 * Mock window.matchMedia
 */
export function mockMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

/**
 * Generate random string for testing
 */
export function randomString(length: number = 10) {
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * Create mock weekly stats
 */
export function createMockWeeklyStats(overrides = {}) {
  return {
    total_tasks: 10,
    completed_tasks: 7,
    pending_tasks: 3,
    high_priority_tasks: 2,
    medium_priority_tasks: 3,
    low_priority_tasks: 2,
    categories_used: ['work', 'personal'],
    completion_rate: 70,
    daily_breakdown: [
      {
        date: createRelativeDate(-6),
        day_name: 'Monday',
        task_count: 2,
        completed_count: 1,
      },
      {
        date: createRelativeDate(-5),
        day_name: 'Tuesday',
        task_count: 3,
        completed_count: 2,
      },
    ],
    ...overrides,
  }
}

/**
 * Delay execution for testing async operations
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Retry a function until it succeeds or max attempts reached
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts) {
        await delay(delayMs)
      }
    }
  }

  throw lastError
}

/**
 * Test data generators
 */
export const generators = {
  task: createMockTask,
  tasks: createMockTasks,
  user: createMockUser,
  session: createMockSession,
  weeklyStats: createMockWeeklyStats,
  date: createRelativeDate,
  time: createMockTime,
  string: randomString,
}

/**
 * Common test utilities
 */
export const testUtils = {
  suppressConsoleLogs,
  mockMatchMedia,
  waitFor: delay,
  retry,
  expectThrowsAsync,
}

/**
 * Mock implementations
 */
export const mocks = {
  supabaseClient: createMockSupabaseClient,
  voiceResult: createMockVoiceResult,
}

