import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import WeeklyDigest from '../WeeklyDigest'
import { supabase } from '@/integrations/supabase/client'

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('WeeklyDigest', () => {
  const mockUserId = 'test-user-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial render', () => {
    it('should show "Show Weekly Digest" button initially', () => {
      render(<WeeklyDigest userId={mockUserId} />)
      expect(screen.getByText('Show Weekly Digest')).toBeInTheDocument()
    })

    it('should not show stats initially', () => {
      render(<WeeklyDigest userId={mockUserId} />)
      expect(screen.queryByText('Weekly Digest')).not.toBeInTheDocument()
    })
  })

  describe('Opening weekly digest', () => {
    it('should show loading state when opened', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      const button = screen.getByText('Show Weekly Digest')
      fireEvent.click(button)

      expect(screen.getByText('Loading your weekly summary...')).toBeInTheDocument()
    })

    it('should fetch stats when opened', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      const button = screen.getByText('Show Weekly Digest')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('tasks')
      })
    })
  })

  describe('Stats display with no tasks', () => {
    it('should show zero stats when no tasks', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })

    it('should show motivational message for zero tasks', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText(/Ready to start fresh/)).toBeInTheDocument()
      })
    })

    it('should not crash with empty daily breakdown', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('No data')).toBeInTheDocument()
      })
    })
  })

  describe('Stats display with tasks', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        completed: true,
        priority: 'high',
        category: 'work',
        created_at: new Date().toISOString(),
        user_id: mockUserId,
      },
      {
        id: '2',
        title: 'Task 2',
        completed: false,
        priority: 'medium',
        category: 'personal',
        created_at: new Date().toISOString(),
        user_id: mockUserId,
      },
      {
        id: '3',
        title: 'Task 3',
        completed: true,
        priority: 'low',
        category: 'work',
        created_at: new Date().toISOString(),
        user_id: mockUserId,
      },
    ]

    it('should display correct task counts', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: mockTasks,
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument() // Total tasks
        expect(screen.getByText('2')).toBeInTheDocument() // Completed
        expect(screen.getByText('1')).toBeInTheDocument() // Pending
      })
    })

    it('should calculate completion rate correctly', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: mockTasks,
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('67%')).toBeInTheDocument() // 2/3 = 67%
      })
    })

    it('should display priority breakdown', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: mockTasks,
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('🔴 High')).toBeInTheDocument()
        expect(screen.getByText('🟡 Medium')).toBeInTheDocument()
        expect(screen.getByText('🟢 Low')).toBeInTheDocument()
      })
    })

    it('should display categories', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: mockTasks,
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument()
        expect(screen.getByText('personal')).toBeInTheDocument()
      })
    })

    it('should show high completion motivational message', async () => {
      const completedTasks = mockTasks.map(task => ({ ...task, completed: true }))
      
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: completedTasks,
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText(/crushing your goals/)).toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      // Should not crash
      await waitFor(() => {
        expect(screen.queryByText('Loading your weekly summary...')).not.toBeInTheDocument()
      })
    })

    it('should not fetch without userId', () => {
      render(<WeeklyDigest userId={undefined} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('User interactions', () => {
    it('should hide digest when close button clicked', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('Weekly Digest')).toBeInTheDocument()
      })

      const closeButton = screen.getByText('✕')
      fireEvent.click(closeButton)

      expect(screen.queryByText('Weekly Digest')).not.toBeInTheDocument()
      expect(screen.getByText('Show Weekly Digest')).toBeInTheDocument()
    })

    it('should refresh stats when refresh button clicked', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('Refresh Stats')).toBeInTheDocument()
      })

      vi.clearAllMocks()

      const refreshButton = screen.getByText('Refresh Stats')
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalled()
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle tasks with missing priority', async () => {
      const tasksWithoutPriority = [
        {
          id: '1',
          title: 'Task 1',
          completed: true,
          created_at: new Date().toISOString(),
          user_id: mockUserId,
        },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: tasksWithoutPriority,
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('No priority tasks this week')).toBeInTheDocument()
      })
    })

    it('should handle tasks with missing categories', async () => {
      const tasksWithoutCategory = [
        {
          id: '1',
          title: 'Task 1',
          completed: true,
          created_at: new Date().toISOString(),
          user_id: mockUserId,
        },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: tasksWithoutCategory,
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument() // Categories used count
      })
    })

    it('should handle very large numbers of tasks', async () => {
      const manyTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        title: `Task ${i}`,
        completed: i % 2 === 0,
        priority: 'high',
        category: 'work',
        created_at: new Date().toISOString(),
        user_id: mockUserId,
      }))

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: manyTasks,
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<WeeklyDigest userId={mockUserId} />)
      
      fireEvent.click(screen.getByText('Show Weekly Digest'))

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument() // Completed
      })
    })
  })
})

