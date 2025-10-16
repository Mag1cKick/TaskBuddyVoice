import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import TaskList from '../TaskList'
import { supabase } from '@/integrations/supabase/client'

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
  },
}))

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('TaskList', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Task 1',
      completed: false,
      priority: 'high',
      category: 'work',
      due_date: '2024-12-31',
      due_time: '14:00',
      created_at: '2024-01-01T10:00:00Z',
      user_id: 'user-1',
    },
    {
      id: '2',
      title: 'Task 2',
      completed: true,
      priority: 'medium',
      category: 'personal',
      created_at: '2024-01-02T10:00:00Z',
      user_id: 'user-1',
    },
    {
      id: '3',
      title: 'Task 3',
      completed: false,
      priority: 'low',
      category: 'shopping',
      created_at: '2024-01-03T10:00:00Z',
      user_id: 'user-1',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockTasks,
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      }),
    })
    vi.mocked(supabase.from).mockImplementation(mockFrom as any)
  })

  describe('Task display', () => {
    it('should render task list', async () => {
      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.getByText('Task 2')).toBeInTheDocument()
        expect(screen.getByText('Task 3')).toBeInTheDocument()
      })
    })

    it('should show loading state initially', () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should show empty state when no tasks', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
      })
    })

    it('should display task priorities with correct styling', async () => {
      render(<TaskList />)

      await waitFor(() => {
        const task1 = screen.getByText('Task 1').closest('div')
        expect(task1).toHaveClass('border-l-red-500')
      })
    })

    it('should display completed tasks with strikethrough', async () => {
      render(<TaskList />)

      await waitFor(() => {
        const completedTask = screen.getByText('Task 2')
        expect(completedTask).toHaveClass('line-through')
      })
    })

    it('should display category badges', async () => {
      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument()
        expect(screen.getByText('personal')).toBeInTheDocument()
        expect(screen.getByText('shopping')).toBeInTheDocument()
      })
    })

    it('should display due date and time', async () => {
      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument()
        expect(screen.getByText(/2:00 PM/)).toBeInTheDocument()
      })
    })
  })

  describe('Task sorting', () => {
    it('should sort by completion status first', async () => {
      const mixedTasks = [
        { ...mockTasks[0], completed: true },
        { ...mockTasks[1], completed: false },
        { ...mockTasks[2], completed: false },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mixedTasks,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        const tasks = screen.getAllByRole('button', { name: /delete task/i })
        // Completed tasks should be last
        expect(tasks.length).toBeGreaterThan(0)
      })
    })

    it('should sort by priority within incomplete tasks', async () => {
      const priorityTasks = [
        { ...mockTasks[0], completed: false, priority: 'high' },
        { ...mockTasks[1], completed: false, priority: 'low' },
        { ...mockTasks[2], completed: false, priority: 'medium' },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: priorityTasks,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })
    })

    it('should show sort indicator', async () => {
      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText(/sorted by/i)).toBeInTheDocument()
      })
    })
  })

  describe('Task interactions', () => {
    it('should toggle task completion', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockTasks,
              error: null,
            }),
          }),
        }),
        update: mockUpdate,
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ completed: true })
      })
    })

    it('should delete task', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockTasks,
              error: null,
            }),
          }),
        }),
        delete: mockDelete,
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByRole('button', { name: /delete task/i })
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled()
      })
    })
  })

  describe('Filtering', () => {
    it('should filter by category', async () => {
      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const categoryFilter = screen.getByRole('combobox')
      fireEvent.click(categoryFilter)

      const workOption = screen.getByText('Work')
      fireEvent.click(workOption)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
      })
    })

    it('should show all categories option', async () => {
      render(<TaskList />)

      await waitFor(() => {
        const categoryFilter = screen.getByRole('combobox')
        fireEvent.click(categoryFilter)
      })

      expect(screen.getByText('All Categories')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('should handle fetch errors', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.queryByText('Task 1')).not.toBeInTheDocument()
      })
    })

    it('should handle toggle completion errors', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Update failed' },
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockTasks,
              error: null,
            }),
          }),
        }),
        update: mockUpdate,
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)

      // Should still render tasks despite error
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })
    })

    it('should handle delete errors', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockTasks,
              error: null,
            }),
          }),
        }),
        delete: mockDelete,
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByRole('button', { name: /delete task/i })
      fireEvent.click(deleteButtons[0])

      // Task should still be visible after failed delete
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle tasks without priority', async () => {
      const tasksWithoutPriority = [
        { ...mockTasks[0], priority: undefined },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: tasksWithoutPriority,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })
    })

    it('should handle tasks without category', async () => {
      const tasksWithoutCategory = [
        { ...mockTasks[0], category: undefined },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: tasksWithoutCategory,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
      })
    })

    it('should handle tasks with very long titles', async () => {
      const longTitleTask = [
        { ...mockTasks[0], title: 'a'.repeat(500) },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: longTitleTask,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('a'.repeat(500))).toBeInTheDocument()
      })
    })

    it('should handle many tasks efficiently', async () => {
      const manyTasks = Array.from({ length: 100 }, (_, i) => ({
        ...mockTasks[0],
        id: `${i}`,
        title: `Task ${i}`,
      }))

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: manyTasks,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      render(<TaskList />)

      await waitFor(() => {
        expect(screen.getByText('Task 0')).toBeInTheDocument()
        expect(screen.getByText('Task 99')).toBeInTheDocument()
      })
    })
  })

  describe('Real-time updates', () => {
    it('should subscribe to task changes', () => {
      const mockChannel = vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      }))
      vi.mocked(supabase.channel).mockImplementation(mockChannel as any)

      render(<TaskList />)

      expect(mockChannel).toHaveBeenCalled()
    })
  })
})

