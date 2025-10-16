import { describe, it, expect } from 'vitest'
import { parseVoiceInput } from '../voiceTaskParser'

describe('voiceTaskParser', () => {
  describe('Basic task parsing', () => {
    it('should parse a simple task', () => {
      const result = parseVoiceInput('buy groceries')
      expect(result.title).toBe('buy groceries')
      expect(result.priority).toBeUndefined()
      expect(result.category).toBeUndefined()
    })

    it('should handle empty input', () => {
      const result = parseVoiceInput('')
      expect(result.title).toBe('')
    })

    it('should handle whitespace-only input', () => {
      const result = parseVoiceInput('   ')
      expect(result.title).toBe('')
    })
  })

  describe('Priority parsing', () => {
    it('should parse high priority tasks', () => {
      const testCases = [
        'high priority buy milk',
        'urgent call doctor',
        'important meeting tomorrow',
        'critical fix bug',
      ]
      
      testCases.forEach(input => {
        const result = parseVoiceInput(input)
        expect(result.priority).toBe('high')
      })
    })

    it('should parse medium priority tasks', () => {
      const testCases = [
        'medium priority email team',
        'moderate importance review code',
      ]
      
      testCases.forEach(input => {
        const result = parseVoiceInput(input)
        expect(result.priority).toBe('medium')
      })
    })

    it('should parse low priority tasks', () => {
      const testCases = [
        'low priority organize desk',
        'minor task clean room',
      ]
      
      testCases.forEach(input => {
        const result = parseVoiceInput(input)
        expect(result.priority).toBe('low')
      })
    })

    it('should remove priority keywords from title', () => {
      const result = parseVoiceInput('high priority buy milk')
      expect(result.title).not.toContain('high priority')
      expect(result.title).toContain('buy milk')
    })
  })

  describe('Category parsing', () => {
    it('should parse work category', () => {
      const result = parseVoiceInput('work meeting at 3pm')
      expect(result.category).toBe('work')
    })

    it('should parse personal category', () => {
      const result = parseVoiceInput('personal dentist appointment')
      expect(result.category).toBe('personal')
    })

    it('should parse shopping category', () => {
      const result = parseVoiceInput('shopping buy new shoes')
      expect(result.category).toBe('shopping')
    })

    it('should parse health category', () => {
      const result = parseVoiceInput('health gym workout')
      expect(result.category).toBe('health')
    })

    it('should parse finance category', () => {
      const result = parseVoiceInput('finance pay bills')
      expect(result.category).toBe('finance')
    })

    it('should remove category keywords from title', () => {
      const result = parseVoiceInput('work review presentation')
      expect(result.title).not.toContain('work')
      expect(result.title).toContain('review presentation')
    })
  })

  describe('Date parsing', () => {
    it('should parse "today"', () => {
      const result = parseVoiceInput('buy milk today')
      expect(result.dueDate).toBeDefined()
      expect(result.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should parse "tomorrow"', () => {
      const result = parseVoiceInput('meeting tomorrow')
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const expectedDate = tomorrow.toISOString().split('T')[0]
      expect(result.dueDate).toBe(expectedDate)
    })

    it('should parse "next week"', () => {
      const result = parseVoiceInput('project deadline next week')
      expect(result.dueDate).toBeDefined()
      expect(result.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should parse "in X days"', () => {
      const result = parseVoiceInput('return books in 3 days')
      const expected = new Date()
      expected.setDate(expected.getDate() + 3)
      const expectedDate = expected.toISOString().split('T')[0]
      expect(result.dueDate).toBe(expectedDate)
    })

    it('should parse specific weekday', () => {
      const result = parseVoiceInput('appointment on Monday')
      expect(result.dueDate).toBeDefined()
      expect(result.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should parse specific date format', () => {
      const result = parseVoiceInput('meeting on January 15')
      expect(result.dueDate).toBeDefined()
      expect(result.dueDate).toContain('-01-15')
    })

    it('should parse date with year', () => {
      const result = parseVoiceInput('vacation July 4th 2026')
      expect(result.dueDate).toBe('2026-07-04')
    })

    it('should remove date keywords from title', () => {
      const result = parseVoiceInput('buy milk tomorrow')
      expect(result.title).not.toContain('tomorrow')
      expect(result.title).toContain('buy milk')
    })
  })

  describe('Time parsing', () => {
    it('should parse time with "at"', () => {
      const result = parseVoiceInput('meeting at 3pm')
      expect(result.dueTime).toBe('15:00')
    })

    it('should parse time without "at"', () => {
      const result = parseVoiceInput('appointment 10am')
      expect(result.dueTime).toBe('10:00')
    })

    it('should parse 24-hour format', () => {
      const result = parseVoiceInput('call at 14:30')
      expect(result.dueTime).toBe('14:30')
    })

    it('should parse time with minutes', () => {
      const result = parseVoiceInput('meeting at 3:45pm')
      expect(result.dueTime).toBe('15:45')
    })

    it('should parse noon', () => {
      const result = parseVoiceInput('lunch at noon')
      expect(result.dueTime).toBe('12:00')
    })

    it('should parse midnight', () => {
      const result = parseVoiceInput('task at midnight')
      expect(result.dueTime).toBe('00:00')
    })

    it('should remove time keywords from title', () => {
      const result = parseVoiceInput('meeting at 3pm')
      expect(result.title).not.toContain('at 3pm')
      expect(result.title).toContain('meeting')
    })
  })

  describe('Description parsing', () => {
    it('should parse description after "note"', () => {
      const result = parseVoiceInput('buy milk note get whole milk not skim')
      expect(result.description).toContain('get whole milk not skim')
    })

    it('should parse description after "reminder"', () => {
      const result = parseVoiceInput('call mom reminder ask about dinner')
      expect(result.description).toContain('ask about dinner')
    })

    it('should parse description after "details"', () => {
      const result = parseVoiceInput('meeting details bring presentation slides')
      expect(result.description).toContain('bring presentation slides')
    })

    it('should not include description keyword in title', () => {
      const result = parseVoiceInput('buy milk note get organic')
      expect(result.title).toBe('buy milk')
    })
  })

  describe('Complex task parsing', () => {
    it('should parse task with priority, category, date, and time', () => {
      const result = parseVoiceInput('high priority work meeting tomorrow at 3pm')
      expect(result.priority).toBe('high')
      expect(result.category).toBe('work')
      expect(result.dueDate).toBeDefined()
      expect(result.dueTime).toBe('15:00')
      expect(result.title).toContain('meeting')
    })

    it('should parse task with all attributes', () => {
      const result = parseVoiceInput(
        'urgent work presentation next Monday at 2pm note prepare slides and handouts'
      )
      expect(result.priority).toBe('high')
      expect(result.category).toBe('work')
      expect(result.dueDate).toBeDefined()
      expect(result.dueTime).toBe('14:00')
      expect(result.description).toContain('prepare slides and handouts')
      expect(result.title).toContain('presentation')
    })

    it('should handle multiple keywords correctly', () => {
      const result = parseVoiceInput('important personal doctor appointment tomorrow at 10am')
      expect(result.priority).toBe('high')
      expect(result.category).toBe('personal')
      expect(result.dueTime).toBe('10:00')
    })
  })

  describe('Edge cases', () => {
    it('should handle task with only keywords', () => {
      const result = parseVoiceInput('urgent important tomorrow')
      expect(result.priority).toBe('high')
      expect(result.dueDate).toBeDefined()
    })

    it('should handle very long input', () => {
      const longInput = 'urgent work ' + 'a'.repeat(500)
      const result = parseVoiceInput(longInput)
      expect(result.priority).toBe('high')
      expect(result.category).toBe('work')
      expect(result.title.length).toBeGreaterThan(0)
    })

    it('should handle input with special characters', () => {
      const result = parseVoiceInput('buy items: milk, bread, & eggs @ store')
      expect(result.title).toContain('buy items')
    })

    it('should handle case-insensitive keywords', () => {
      const result = parseVoiceInput('HIGH PRIORITY WORK MEETING TOMORROW')
      expect(result.priority).toBe('high')
      expect(result.category).toBe('work')
      expect(result.dueDate).toBeDefined()
    })

    it('should handle multiple spaces', () => {
      const result = parseVoiceInput('buy    milk    tomorrow')
      expect(result.title).toContain('buy')
      expect(result.title).toContain('milk')
    })
  })

  describe('Confidence scoring', () => {
    it('should have high confidence for well-structured tasks', () => {
      const result = parseVoiceInput('high priority work meeting tomorrow at 3pm')
      expect(result.confidence).toBeGreaterThanOrEqual(80)
    })

    it('should have medium confidence for partially structured tasks', () => {
      const result = parseVoiceInput('meeting tomorrow')
      expect(result.confidence).toBeGreaterThanOrEqual(50)
      expect(result.confidence).toBeLessThan(80)
    })

    it('should have low confidence for simple tasks', () => {
      const result = parseVoiceInput('buy milk')
      expect(result.confidence).toBeLessThan(50)
    })

    it('should provide confidence reasons', () => {
      const result = parseVoiceInput('high priority work meeting tomorrow at 3pm')
      expect(result.confidenceReasons).toBeDefined()
      expect(result.confidenceReasons.length).toBeGreaterThan(0)
    })
  })

  describe('Real-world examples', () => {
    it('should parse grocery shopping task', () => {
      const result = parseVoiceInput('shopping buy groceries tomorrow at 10am note milk eggs bread')
      expect(result.category).toBe('shopping')
      expect(result.dueDate).toBeDefined()
      expect(result.dueTime).toBe('10:00')
      expect(result.description).toContain('milk eggs bread')
    })

    it('should parse work meeting task', () => {
      const result = parseVoiceInput('urgent work team meeting next Monday at 2pm')
      expect(result.priority).toBe('high')
      expect(result.category).toBe('work')
      expect(result.title).toContain('team meeting')
    })

    it('should parse doctor appointment', () => {
      const result = parseVoiceInput('important personal doctor appointment Friday at 3:30pm')
      expect(result.priority).toBe('high')
      expect(result.category).toBe('personal')
      expect(result.dueTime).toBe('15:30')
    })

    it('should parse payment reminder', () => {
      const result = parseVoiceInput('finance pay rent on the 1st note due by end of day')
      expect(result.category).toBe('finance')
      expect(result.description).toContain('due by end of day')
    })
  })
})

