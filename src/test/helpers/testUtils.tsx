import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * Custom render function that includes all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock user for testing
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
};

/**
 * Mock task for testing
 */
export const mockTask = {
  id: 'test-task-id',
  user_id: 'test-user-id',
  title: 'Test Task',
  description: 'Test Description',
  priority: 'medium' as const,
  category: 'work' as const,
  completed: false,
  due_date: '2024-12-31',
  due_time: '14:00',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock parsed task from voice input
 */
export const mockParsedTask = {
  title: 'Buy groceries',
  description: 'Get milk and bread',
  priority: 'medium' as const,
  category: 'shopping' as const,
  dueDate: '2024-12-31',
  dueTime: '14:00',
  confidence: 0.9,
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create mock session
 */
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

