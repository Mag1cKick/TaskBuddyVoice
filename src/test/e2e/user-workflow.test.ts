import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { supabase } from '@/integrations/supabase/client'

/**
 * End-to-End User Workflow Tests
 * Tests realistic user scenarios with actual task operations
 */
describe('User Workflow E2E Tests', () => {
  const testUser = {
    id: `test-user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
  }

  const createdTaskIds: string[] = []

  afterAll(async () => {
    // Cleanup: Delete all created tasks
    if (createdTaskIds.length > 0) {
      await supabase.from('tasks').delete().in('id', createdTaskIds)
    }
  })

  describe('Task Creation Scenarios', () => {
    it('should create a simple task', async () => {
      const task = {
        title: 'Buy groceries',
        completed: false,
        user_id: testUser.id,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.title).toBe('Buy groceries')
      
      if (data) createdTaskIds.push(data.id)
    })

    it('should create a task with priority', async () => {
      const task = {
        title: 'Urgent meeting',
        completed: false,
        priority: 'high' as const,
        user_id: testUser.id,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.priority).toBe('high')
      
      if (data) createdTaskIds.push(data.id)
    })

    it('should create a task with category', async () => {
      const task = {
        title: 'Team standup',
        completed: false,
        category: 'work',
        user_id: testUser.id,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.category).toBe('work')
      
      if (data) createdTaskIds.push(data.id)
    })

    it('should create a task with due date', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dueDate = tomorrow.toISOString().split('T')[0]

      const task = {
        title: 'Submit report',
        completed: false,
        due_date: dueDate,
        user_id: testUser.id,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.due_date).toBe(dueDate)
      
      if (data) createdTaskIds.push(data.id)
    })

    it('should create a task with due time', async () => {
      const task = {
        title: 'Dentist appointment',
        completed: false,
        due_time: '14:30',
        user_id: testUser.id,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.due_time).toBe('14:30:00')
      
      if (data) createdTaskIds.push(data.id)
    })

    it('should create a complete task with all fields', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const task = {
        title: 'Important client presentation',
        completed: false,
        priority: 'high' as const,
        category: 'work',
        due_date: tomorrow.toISOString().split('T')[0],
        due_time: '10:00',
        description: 'Prepare slides and demo',
        user_id: testUser.id,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.title).toBe('Important client presentation')
      expect(data?.priority).toBe('high')
      expect(data?.category).toBe('work')
      expect(data?.description).toBe('Prepare slides and demo')
      
      if (data) createdTaskIds.push(data.id)
    })
  })

  describe('Task Retrieval and Filtering', () => {
    beforeAll(async () => {
      // Create test tasks
      const testTasks = [
        { title: 'High priority work task', priority: 'high', category: 'work', completed: false, user_id: testUser.id },
        { title: 'Medium priority personal task', priority: 'medium', category: 'personal', completed: false, user_id: testUser.id },
        { title: 'Low priority shopping task', priority: 'low', category: 'shopping', completed: true, user_id: testUser.id },
        { title: 'Completed work task', category: 'work', completed: true, user_id: testUser.id },
      ]

      for (const task of testTasks) {
        const { data } = await supabase.from('tasks').insert(task).select().single()
        if (data) createdTaskIds.push(data.id)
      }
    })

    it('should retrieve all user tasks', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.length).toBeGreaterThan(0)
    })

    it('should filter tasks by completion status', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('completed', false)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.every(task => !task.completed)).toBe(true)
    })

    it('should filter tasks by priority', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('priority', 'high')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.every(task => task.priority === 'high')).toBe(true)
    })

    it('should filter tasks by category', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('category', 'work')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.every(task => task.category === 'work')).toBe(true)
    })

    it('should sort tasks by created_at', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      // Verify sorted order
      if (data && data.length > 1) {
        const firstDate = new Date(data[0].created_at).getTime()
        const secondDate = new Date(data[1].created_at).getTime()
        expect(firstDate).toBeGreaterThanOrEqual(secondDate)
      }
    })
  })

  describe('Task Updates', () => {
    let taskId: string

    beforeAll(async () => {
      const { data } = await supabase
        .from('tasks')
        .insert({
          title: 'Task to update',
          completed: false,
          user_id: testUser.id,
        })
        .select()
        .single()

      if (data) {
        taskId = data.id
        createdTaskIds.push(taskId)
      }
    })

    it('should mark task as completed', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed: true })
        .eq('id', taskId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.completed).toBe(true)
    })

    it('should update task priority', async () => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ priority: 'high' })
        .eq('id', taskId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.priority).toBe('high')
    })

    it('should update task title', async () => {
      const newTitle = 'Updated task title'
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ title: newTitle })
        .eq('id', taskId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.title).toBe(newTitle)
    })

    it('should update multiple fields at once', async () => {
      const updates = {
        title: 'Fully updated task',
        priority: 'medium' as const,
        category: 'personal',
        description: 'New description',
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.title).toBe(updates.title)
      expect(data?.priority).toBe(updates.priority)
      expect(data?.category).toBe(updates.category)
      expect(data?.description).toBe(updates.description)
    })
  })

  describe('Task Deletion', () => {
    it('should delete a task', async () => {
      // Create a task to delete
      const { data: task } = await supabase
        .from('tasks')
        .insert({
          title: 'Task to delete',
          completed: false,
          user_id: testUser.id,
        })
        .select()
        .single()

      expect(task).toBeDefined()

      // Delete the task
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task!.id)

      expect(deleteError).toBeNull()

      // Verify task is deleted
      const { data: deletedTask } = await supabase
        .from('tasks')
        .select()
        .eq('id', task!.id)
        .single()

      expect(deletedTask).toBeNull()
    })

    it('should delete multiple tasks', async () => {
      // Create tasks to delete
      const tasks = [
        { title: 'Task 1 to delete', user_id: testUser.id },
        { title: 'Task 2 to delete', user_id: testUser.id },
      ]

      const { data: createdTasks } = await supabase
        .from('tasks')
        .insert(tasks)
        .select()

      const taskIds = createdTasks?.map(t => t.id) || []
      expect(taskIds.length).toBe(2)

      // Delete all tasks
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', taskIds)

      expect(error).toBeNull()

      // Verify tasks are deleted
      const { data: remainingTasks } = await supabase
        .from('tasks')
        .select()
        .in('id', taskIds)

      expect(remainingTasks?.length).toBe(0)
    })
  })

  describe('Realistic User Scenarios', () => {
    it('Scenario 1: Daily work routine', async () => {
      // Morning: Create high priority tasks
      const morningTasks = [
        { title: 'Check emails', priority: 'high', category: 'work', user_id: testUser.id },
        { title: 'Team standup', priority: 'high', category: 'work', due_time: '09:00', user_id: testUser.id },
      ]

      const { data: morning } = await supabase
        .from('tasks')
        .insert(morningTasks)
        .select()

      expect(morning).toBeDefined()
      morning?.forEach(task => createdTaskIds.push(task.id))

      // Complete morning tasks
      if (morning) {
        await supabase
          .from('tasks')
          .update({ completed: true })
          .in('id', morning.map(t => t.id))
      }

      // Afternoon: Add more tasks
      const afternoonTask = {
        title: 'Code review',
        priority: 'medium',
        category: 'work',
        user_id: testUser.id,
      }

      const { data: afternoon } = await supabase
        .from('tasks')
        .insert(afternoonTask)
        .select()
        .single()

      if (afternoon) createdTaskIds.push(afternoon.id)

      // Verify workflow
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)
        .in('id', [...(morning?.map(t => t.id) || []), afternoon?.id || ''])

      expect(allTasks?.length).toBe(3)
      expect(allTasks?.filter(t => t.completed).length).toBe(2)
    })

    it('Scenario 2: Weekly planning', async () => {
      const today = new Date()
      const weekTasks = []

      // Create tasks for each day of the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)

        weekTasks.push({
          title: `Task for ${date.toLocaleDateString()}`,
          due_date: date.toISOString().split('T')[0],
          category: 'personal',
          user_id: testUser.id,
        })
      }

      const { data } = await supabase
        .from('tasks')
        .insert(weekTasks)
        .select()

      expect(data?.length).toBe(7)
      data?.forEach(task => createdTaskIds.push(task.id))

      // Retrieve this week's tasks
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const { data: weekData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)
        .gte('due_date', weekStart.toISOString().split('T')[0])
        .lte('due_date', weekEnd.toISOString().split('T')[0])

      expect(weekData).toBeDefined()
      expect(weekData!.length).toBeGreaterThanOrEqual(7)
    })

    it('Scenario 3: Priority management', async () => {
      // Create mixed priority tasks
      const tasks = [
        { title: 'Critical bug fix', priority: 'high', category: 'work', user_id: testUser.id },
        { title: 'Update documentation', priority: 'low', category: 'work', user_id: testUser.id },
        { title: 'Review PR', priority: 'medium', category: 'work', user_id: testUser.id },
        { title: 'Refactor code', priority: 'low', category: 'work', user_id: testUser.id },
      ]

      const { data } = await supabase
        .from('tasks')
        .insert(tasks)
        .select()

      data?.forEach(task => createdTaskIds.push(task.id))

      // Get high priority tasks first
      const { data: highPriority } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('priority', 'high')
        .eq('completed', false)

      expect(highPriority?.length).toBeGreaterThan(0)
      
      // Complete high priority task
      if (highPriority && highPriority.length > 0) {
        await supabase
          .from('tasks')
          .update({ completed: true })
          .eq('id', highPriority[0].id)
      }

      // Move to medium priority
      const { data: mediumPriority } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('priority', 'medium')
        .eq('completed', false)

      expect(mediumPriority).toBeDefined()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle task with missing optional fields', async () => {
      const minimalTask = {
        title: 'Minimal task',
        user_id: testUser.id,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(minimalTask)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.title).toBe('Minimal task')
      expect(data?.completed).toBeDefined() // Should have default value
      
      if (data) createdTaskIds.push(data.id)
    })

    it('should handle very long task titles', async () => {
      const longTitle = 'A'.repeat(500)
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: longTitle,
          user_id: testUser.id,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.title.length).toBe(500)
      
      if (data) createdTaskIds.push(data.id)
    })

    it('should handle special characters in task title', async () => {
      const specialTitle = 'Task with émojis 🎉 and spëcial chars: @#$%'
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: specialTitle,
          user_id: testUser.id,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.title).toBe(specialTitle)
      
      if (data) createdTaskIds.push(data.id)
    })

    it('should handle bulk task creation', async () => {
      const bulkTasks = Array.from({ length: 50 }, (_, i) => ({
        title: `Bulk task ${i + 1}`,
        user_id: testUser.id,
      }))

      const { data, error } = await supabase
        .from('tasks')
        .insert(bulkTasks)
        .select()

      expect(error).toBeNull()
      expect(data?.length).toBe(50)
      
      data?.forEach(task => createdTaskIds.push(task.id))
    })
  })
})

