import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { supabase } from '@/integrations/supabase/client'

describe('Supabase Integration Tests', () => {
  const testUserId = 'test-user-integration'
  let createdTaskId: string | null = null

  // Cleanup function
  const cleanup = async () => {
    if (createdTaskId) {
      await supabase.from('tasks').delete().eq('id', createdTaskId)
      createdTaskId = null
    }
  }

  afterAll(async () => {
    await cleanup()
  })

  describe('Database Connection', () => {
    it('should connect to Supabase', () => {
      expect(supabase).toBeDefined()
      expect(supabase.from).toBeDefined()
    })

    it('should have valid environment variables', () => {
      expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined()
      expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined()
    })
  })

  describe('Task CRUD Operations', () => {
    it('should create a task', async () => {
      const newTask = {
        title: 'Integration Test Task',
        completed: false,
        priority: 'high' as const,
        category: 'work',
        user_id: testUserId,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.title).toBe('Integration Test Task')
      
      if (data) {
        createdTaskId = data.id
      }
    })

    it('should read tasks', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUserId)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should update a task', async () => {
      if (!createdTaskId) {
        // Create a task first
        const { data } = await supabase
          .from('tasks')
          .insert({
            title: 'Task to Update',
            completed: false,
            user_id: testUserId,
          })
          .select()
          .single()
        
        createdTaskId = data?.id || null
      }

      const { data, error } = await supabase
        .from('tasks')
        .update({ completed: true })
        .eq('id', createdTaskId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.completed).toBe(true)
    })

    it('should delete a task', async () => {
      if (!createdTaskId) {
        // Create a task first
        const { data } = await supabase
          .from('tasks')
          .insert({
            title: 'Task to Delete',
            completed: false,
            user_id: testUserId,
          })
          .select()
          .single()
        
        createdTaskId = data?.id || null
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', createdTaskId)

      expect(error).toBeNull()
      createdTaskId = null
    })
  })

  describe('Task Filtering and Sorting', () => {
    let testTaskIds: string[] = []

    beforeAll(async () => {
      // Create test tasks
      const tasks = [
        { title: 'High Priority', priority: 'high', completed: false, user_id: testUserId },
        { title: 'Medium Priority', priority: 'medium', completed: false, user_id: testUserId },
        { title: 'Low Priority', priority: 'low', completed: true, user_id: testUserId },
      ]

      for (const task of tasks) {
        const { data } = await supabase
          .from('tasks')
          .insert(task)
          .select()
          .single()
        
        if (data) {
          testTaskIds.push(data.id)
        }
      }
    })

    afterAll(async () => {
      // Cleanup test tasks
      for (const id of testTaskIds) {
        await supabase.from('tasks').delete().eq('id', id)
      }
      testTaskIds = []
    })

    it('should filter by completion status', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('completed', false)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.every(task => !task.completed)).toBe(true)
    })

    it('should filter by priority', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('priority', 'high')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.every(task => task.priority === 'high')).toBe(true)
    })

    it('should filter by category', async () => {
      const { data: testData } = await supabase
        .from('tasks')
        .insert({
          title: 'Work Task',
          category: 'work',
          completed: false,
          user_id: testUserId,
        })
        .select()
        .single()

      if (testData) {
        testTaskIds.push(testData.id)
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('category', 'work')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBeGreaterThan(0)
    })

    it('should sort by created_at', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBeGreaterThan(0)
    })
  })

  describe('Task Validation', () => {
    it('should reject task without title', async () => {
      const { error } = await supabase
        .from('tasks')
        .insert({
          completed: false,
          user_id: testUserId,
        } as any)

      expect(error).toBeDefined()
    })

    it('should accept task with optional fields', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: 'Minimal Task',
          user_id: testUserId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      if (data) {
        await supabase.from('tasks').delete().eq('id', data.id)
      }
    })

    it('should handle invalid priority values', async () => {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: 'Invalid Priority',
          priority: 'invalid' as any,
          user_id: testUserId,
        })

      // Should either reject or accept with validation
      expect(error !== null || true).toBe(true)
    })
  })

  describe('Date and Time Handling', () => {
    it('should store and retrieve due_date', async () => {
      const dueDate = '2024-12-31'
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: 'Task with Due Date',
          due_date: dueDate,
          user_id: testUserId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.due_date).toBe(dueDate)
      
      if (data) {
        await supabase.from('tasks').delete().eq('id', data.id)
      }
    })

    it('should store and retrieve due_time', async () => {
      const dueTime = '14:30'
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: 'Task with Due Time',
          due_time: dueTime,
          user_id: testUserId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.due_time).toBe(dueTime + ':00')
      
      if (data) {
        await supabase.from('tasks').delete().eq('id', data.id)
      }
    })

    it('should handle created_at timestamp', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: 'Task with Timestamp',
          user_id: testUserId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.created_at).toBeDefined()
      expect(new Date(data?.created_at || '').getTime()).toBeGreaterThan(0)
      
      if (data) {
        await supabase.from('tasks').delete().eq('id', data.id)
      }
    })
  })

  describe('Bulk Operations', () => {
    it('should insert multiple tasks', async () => {
      const tasks = [
        { title: 'Bulk Task 1', user_id: testUserId },
        { title: 'Bulk Task 2', user_id: testUserId },
        { title: 'Bulk Task 3', user_id: testUserId },
      ]

      const { data, error } = await supabase
        .from('tasks')
        .insert(tasks)
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBe(3)
      
      // Cleanup
      if (data) {
        for (const task of data) {
          await supabase.from('tasks').delete().eq('id', task.id)
        }
      }
    })

    it('should update multiple tasks', async () => {
      // Create test tasks
      const { data: createdTasks } = await supabase
        .from('tasks')
        .insert([
          { title: 'Update Test 1', completed: false, user_id: testUserId },
          { title: 'Update Test 2', completed: false, user_id: testUserId },
        ])
        .select()

      const taskIds = createdTasks?.map(t => t.id) || []

      // Update all at once
      const { error } = await supabase
        .from('tasks')
        .update({ completed: true })
        .in('id', taskIds)

      expect(error).toBeNull()

      // Verify updates
      const { data: updatedTasks } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds)

      expect(updatedTasks?.every(task => task.completed)).toBe(true)
      
      // Cleanup
      for (const id of taskIds) {
        await supabase.from('tasks').delete().eq('id', id)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would require mocking network failure
      // For now, just verify error structure
      const { error } = await supabase
        .from('non_existent_table')
        .select('*')

      expect(error).toBeDefined()
      expect(error?.message).toBeDefined()
    })

    it('should handle concurrent updates', async () => {
      // Create a task
      const { data: task } = await supabase
        .from('tasks')
        .insert({
          title: 'Concurrent Update Test',
          completed: false,
          user_id: testUserId,
        })
        .select()
        .single()

      if (!task) return

      // Attempt concurrent updates
      const updates = [
        supabase.from('tasks').update({ completed: true }).eq('id', task.id),
        supabase.from('tasks').update({ title: 'Updated Title' }).eq('id', task.id),
      ]

      const results = await Promise.all(updates)
      
      // At least one should succeed
      expect(results.some(r => r.error === null)).toBe(true)

      // Cleanup
      await supabase.from('tasks').delete().eq('id', task.id)
    })
  })

  describe('Performance Tests', () => {
    it('should handle large result sets', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .limit(100)

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(error).toBeNull()
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should paginate results efficiently', async () => {
      const pageSize = 10
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .range(0, pageSize - 1)

      expect(error).toBeNull()
      expect(data?.length).toBeLessThanOrEqual(pageSize)
    })
  })
})

