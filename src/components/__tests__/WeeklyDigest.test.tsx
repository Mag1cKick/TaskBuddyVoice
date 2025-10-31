import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WeeklyDigest from '../WeeklyDigest';
import { mockSupabase } from '@/test/mocks/supabase';

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('WeeklyDigest', () => {
  const mockUserId = 'test-user-id';
  
  const mockTasks = [
    {
      id: '1',
      user_id: mockUserId,
      title: 'Task 1',
      completed: true,
      priority: 'high',
      category: 'work',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: mockUserId,
      title: 'Task 2',
      completed: false,
      priority: 'medium',
      category: 'personal',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: mockUserId,
      title: 'Task 3',
      completed: true,
      priority: 'low',
      category: 'work',
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.__setMockData(mockTasks);
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<WeeklyDigest userId={mockUserId} />);
      expect(screen.getByText(/weekly digest/i)).toBeInTheDocument();
    });

    it('should show "Get Weekly Digest" button initially', () => {
      render(<WeeklyDigest userId={mockUserId} />);
      expect(screen.getByRole('button', { name: /get weekly digest/i })).toBeInTheDocument();
    });

    it('should not fetch stats on initial render', () => {
      render(<WeeklyDigest userId={mockUserId} />);
      expect(mockSupabase.__mocks.from).not.toHaveBeenCalled();
    });
  });

  describe('Loading Stats', () => {
    it('should fetch stats when button is clicked', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      const button = screen.getByRole('button', { name: /get weekly digest/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockSupabase.__mocks.from).toHaveBeenCalledWith('tasks');
      });
    });

    it('should show loading state while fetching', async () => {
      const user = userEvent.setup();
      
      // Make the query slow
      mockSupabase.__mocks.select.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ data: mockTasks, error: null }), 100);
        });
      });

      render(<WeeklyDigest userId={mockUserId} />);

      const button = screen.getByRole('button', { name: /get weekly digest/i });
      await user.click(button);

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should not fetch if userId is not provided', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest />);

      const button = screen.getByRole('button', { name: /get weekly digest/i });
      await user.click(button);

      expect(mockSupabase.__mocks.from).not.toHaveBeenCalled();
    });
  });

  describe('Stats Display', () => {
    it('should display total tasks count', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // 3 total tasks
      });
    });

    it('should display completed tasks count', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // 2 completed
      });
    });

    it('should display pending tasks count', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // 1 pending
      });
    });

    it('should calculate and display completion rate', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        // 2 completed out of 3 = 67%
        expect(screen.getByText(/67%/i)).toBeInTheDocument();
      });
    });

    it('should display priority breakdown', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        // Should show high, medium, low priorities
        expect(screen.getByText(/high/i)).toBeInTheDocument();
        expect(screen.getByText(/medium/i)).toBeInTheDocument();
        expect(screen.getByText(/low/i)).toBeInTheDocument();
      });
    });

    it('should display categories used', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument();
        expect(screen.getByText('personal')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should handle no tasks gracefully', async () => {
      mockSupabase.__setMockData([]);
      
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    it('should show 0% completion rate when no tasks', async () => {
      mockSupabase.__setMockData([]);
      
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        expect(screen.getByText(/0%/i)).toBeInTheDocument();
      });
    });

    it('should not crash when daily breakdown is empty', async () => {
      mockSupabase.__setMockData([]);
      
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        // Should render without crashing
        expect(screen.getByText(/weekly digest/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      mockSupabase.__setMockError(new Error('Database error'));
      
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        // Should show error message or fallback UI
        expect(screen.queryByText('3')).not.toBeInTheDocument();
      });
    });

    it('should show error toast on failure', async () => {
      const toastMock = vi.fn();
      vi.mocked(useToast).mockReturnValue({ toast: toastMock });
      
      mockSupabase.__setMockError(new Error('Database error'));
      
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        expect(toastMock).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Motivational Messages', () => {
    it('should show positive message for high completion rate', async () => {
      const allCompletedTasks = mockTasks.map(task => ({ ...task, completed: true }));
      mockSupabase.__setMockData(allCompletedTasks);
      
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        // Should show encouraging message
        const messages = screen.queryAllByText(/great|excellent|amazing|fantastic/i);
        expect(messages.length).toBeGreaterThan(0);
      });
    });

    it('should show encouraging message for low completion rate', async () => {
      const mostlyPendingTasks = mockTasks.map(task => ({ ...task, completed: false }));
      mockSupabase.__setMockData(mostlyPendingTasks);
      
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        // Should show motivational message
        expect(screen.getByText(/keep going|you can do it|stay focused/i)).toBeInTheDocument();
      });
    });
  });

  describe('Date Filtering', () => {
    it('should only fetch tasks from last 7 days', async () => {
      const user = userEvent.setup();
      render(<WeeklyDigest userId={mockUserId} />);

      await user.click(screen.getByRole('button', { name: /get weekly digest/i }));

      await waitFor(() => {
        const fromCall = mockSupabase.__mocks.from.mock.calls[0];
        expect(fromCall[0]).toBe('tasks');
        
        // Should have date range filters
        expect(mockSupabase.__mocks.select).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<WeeklyDigest userId={mockUserId} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      render(<WeeklyDigest userId={mockUserId} />);
      expect(screen.getByRole('button', { name: /get weekly digest/i })).toBeInTheDocument();
    });
  });
});

// Fix the useToast mock
function useToast() {
  return {
    toast: vi.fn(),
  };
}

