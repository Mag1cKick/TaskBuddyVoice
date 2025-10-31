import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VoiceTaskParser } from '../voiceTaskParser';

describe('VoiceTaskParser', () => {
  // Mock Date for consistent testing
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T10:00:00Z')); // Saturday, June 15, 2024
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Task Parsing', () => {
    it('should parse a simple task with trigger', () => {
      const result = VoiceTaskParser.parseVoiceInput('Add task: Buy groceries');
      
      expect(result.title).toBe('Buy groceries');
      expect(result.isValid).toBe(true);
      expect(result.originalText).toBe('Add task: Buy groceries');
    });

    it('should parse a task without explicit trigger', () => {
      const result = VoiceTaskParser.parseVoiceInput('Buy groceries');
      
      expect(result.title).toBe('Buy groceries');
      expect(result.isValid).toBe(true);
    });

    it('should handle empty input', () => {
      const result = VoiceTaskParser.parseVoiceInput('');
      
      expect(result.isValid).toBe(false);
      expect(result.title).toBe('');
    });

    it('should capitalize first letter of title', () => {
      const result = VoiceTaskParser.parseVoiceInput('buy groceries');
      
      expect(result.title).toBe('Buy groceries');
    });
  });

  describe('Priority Extraction', () => {
    it('should detect high priority keywords', () => {
      const testCases = [
        'Add urgent task: Finish report',
        'Important meeting tomorrow',
        'ASAP call client',
        'Critical bug fix needed',
      ];

      testCases.forEach(input => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.priority).toBe('high');
      });
    });

    it('should detect medium priority keywords', () => {
      const testCases = [
        'Add task soon: Review document',
        'Moderate meeting tomorrow',
        'Normal task for later',
      ];

      testCases.forEach(input => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.priority).toBe('medium');
      });
    });

    it('should detect low priority keywords', () => {
      const testCases = [
        'Add task later: Clean desk',
        'Eventually organize files',
        'Sometime clean the garage',
      ];

      testCases.forEach(input => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.priority).toBe('low');
      });
    });

    it('should return undefined priority when no keywords found', () => {
      const result = VoiceTaskParser.parseVoiceInput('Buy groceries');
      expect(result.priority).toBeUndefined();
    });
  });

  describe('Category Extraction', () => {
    it('should detect work category', () => {
      const testCases = [
        'Work meeting tomorrow',
        'Office presentation',
        'Project deadline',
      ];

      testCases.forEach(input => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.category).toBe('work');
      });
    });

    it('should detect shopping category', () => {
      const testCases = [
        'Buy groceries',
        'Purchase new laptop',
        'Shop for clothes',
      ];

      testCases.forEach(input => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.category).toBe('shopping');
      });
    });

    it('should detect personal category', () => {
      const testCases = [
        'Doctor appointment',
        'Exercise routine',
        'Family dinner',
      ];

      testCases.forEach(input => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.category).toBe('personal');
      });
    });

    it('should detect learning category', () => {
      const testCases = [
        'Study for exam',
        'Read book',
        'Research topic',
      ];

      testCases.forEach(input => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.category).toBe('learning');
      });
    });

    it('should detect social category', () => {
      const testCases = [
        'Call mom',
        'Meet friend',
        'Dinner party',
      ];

      testCases.forEach(input => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.category).toBe('social');
      });
    });
  });

  describe('Date Extraction', () => {
    it('should parse "today"', () => {
      const result = VoiceTaskParser.parseVoiceInput('Buy groceries today');
      expect(result.dueDate).toBe('2024-06-15');
    });

    it('should parse "tomorrow"', () => {
      const result = VoiceTaskParser.parseVoiceInput('Meeting tomorrow');
      expect(result.dueDate).toBe('2024-06-16');
    });

    it('should parse relative days', () => {
      const result = VoiceTaskParser.parseVoiceInput('Task in 3 days');
      expect(result.dueDate).toBe('2024-06-18');
    });

    it('should parse relative weeks', () => {
      const result = VoiceTaskParser.parseVoiceInput('Meeting in 2 weeks');
      expect(result.dueDate).toBe('2024-06-29');
    });

    it('should parse "next week"', () => {
      const result = VoiceTaskParser.parseVoiceInput('Task next week');
      // Next Monday from June 15 (Saturday) is June 17
      expect(result.dueDate).toBe('2024-06-17');
    });

    it('should parse specific weekday', () => {
      const result = VoiceTaskParser.parseVoiceInput('Meeting on Monday');
      // Next Monday from June 15 (Saturday) is June 17
      expect(result.dueDate).toBe('2024-06-17');
    });

    it('should parse ISO date format', () => {
      const result = VoiceTaskParser.parseVoiceInput('Task on 2024-12-25');
      expect(result.dueDate).toBe('2024-12-25');
    });

    it('should parse month and day', () => {
      const result = VoiceTaskParser.parseVoiceInput('Task on December 25th');
      expect(result.dueDate).toBe('2024-12-25');
    });
  });

  describe('Time Extraction', () => {
    it('should parse 12-hour format with AM/PM', () => {
      const testCases = [
        { input: 'Meeting at 2:30 PM', expected: '14:30' },
        { input: 'Wake up at 7:00 AM', expected: '07:00' },
        { input: 'Lunch at 12:00 PM', expected: '12:00' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.dueTime).toBe(expected);
      });
    });

    it('should parse hour-only format', () => {
      const testCases = [
        { input: 'Meeting at 2 PM', expected: '14:00' },
        { input: 'Wake up at 7 AM', expected: '07:00' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.dueTime).toBe(expected);
      });
    });

    it('should parse 24-hour format', () => {
      const result = VoiceTaskParser.parseVoiceInput('Meeting at 14:30');
      expect(result.dueTime).toBe('14:30');
    });

    it('should parse general time periods', () => {
      const testCases = [
        { input: 'Task in the morning', expected: '09:00' },
        { input: 'Meeting in the afternoon', expected: '14:00' },
        { input: 'Dinner in the evening', expected: '18:00' },
        { input: 'Task tonight', expected: '20:00' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = VoiceTaskParser.parseVoiceInput(input);
        expect(result.dueTime).toBe(expected);
      });
    });
  });

  describe('Description Extraction', () => {
    it('should extract description with "description:" prefix', () => {
      const result = VoiceTaskParser.parseVoiceInput('Buy groceries description: milk and bread');
      expect(result.description).toBe('Milk and bread');
    });

    it('should extract description with "note:" prefix', () => {
      const result = VoiceTaskParser.parseVoiceInput('Meeting note: bring laptop');
      expect(result.description).toBe('Bring laptop');
    });

    it('should extract description with "details:" prefix', () => {
      const result = VoiceTaskParser.parseVoiceInput('Task details: important stuff');
      expect(result.description).toBe('Important stuff');
    });

    it('should extract description with "with:" prefix', () => {
      const result = VoiceTaskParser.parseVoiceInput('Meeting with: John and Sarah');
      // capitalizeFirst only capitalizes the first letter, so "John and sarah" becomes "John and sarah"
      expect(result.description).toBe('John and sarah');
    });
  });

  describe('Complex Parsing', () => {
    it('should parse task with all attributes', () => {
      const result = VoiceTaskParser.parseVoiceInput(
        'Add urgent work task: Finish presentation tomorrow at 2 PM description: include Q4 results'
      );

      expect(result.title).toBe('Finish presentation');
      expect(result.priority).toBe('high');
      expect(result.category).toBe('work');
      expect(result.dueDate).toBe('2024-06-16');
      expect(result.dueTime).toBe('14:00');
      expect(result.description).toBe('Include q4 results'); // capitalizeFirst only capitalizes first letter
      expect(result.isValid).toBe(true);
    });

    it('should handle multiple priority keywords (first wins)', () => {
      const result = VoiceTaskParser.parseVoiceInput('Urgent task later');
      expect(result.priority).toBe('high'); // 'urgent' comes first
    });

    it('should clean up task title properly', () => {
      const result = VoiceTaskParser.parseVoiceInput('Add task to buy groceries today');
      expect(result.title).not.toContain('to');
      expect(result.title).not.toContain('today');
    });
  });

  describe('Confidence Calculation', () => {
    it('should have high confidence for well-structured task', () => {
      const result = VoiceTaskParser.parseVoiceInput(
        'Add urgent task: Finish report tomorrow at 2 PM'
      );
      
      expect(result.confidence).toBeGreaterThan(70);
      expect(result.confidenceReasons).toContain('Clear task title identified');
      // Check for either "Clear task command detected" or "Implied task"
      const hasTaskRecognition = result.confidenceReasons.some(reason => 
        reason.includes('task command') || reason.includes('Implied task')
      );
      expect(hasTaskRecognition).toBe(true);
    });

    it('should have lower confidence for unclear task', () => {
      const result = VoiceTaskParser.parseVoiceInput('maybe');
      
      expect(result.confidence).toBeLessThan(50);
      expect(result.confidenceReasons).toContain('Very short input');
    });

    it('should include reasons for confidence score', () => {
      const result = VoiceTaskParser.parseVoiceInput('Buy groceries tomorrow');
      
      expect(result.confidenceReasons).toBeInstanceOf(Array);
      expect(result.confidenceReasons.length).toBeGreaterThan(0);
    });

    it('should increase confidence with more metadata', () => {
      const simple = VoiceTaskParser.parseVoiceInput('Buy groceries');
      const detailed = VoiceTaskParser.parseVoiceInput(
        'Add urgent task: Buy groceries tomorrow at 2 PM'
      );
      
      expect(detailed.confidence).toBeGreaterThan(simple.confidence);
    });
  });

  describe('Voice Command Examples', () => {
    it('should provide example commands', () => {
      const examples = VoiceTaskParser.getVoiceCommandExamples();
      
      expect(examples).toBeInstanceOf(Array);
      expect(examples.length).toBeGreaterThan(0);
      expect(examples[0]).toBeTypeOf('string');
    });

    it('should parse all example commands successfully', () => {
      const examples = VoiceTaskParser.getVoiceCommandExamples();
      
      examples.forEach(example => {
        const result = VoiceTaskParser.parseVoiceInput(example);
        expect(result.isValid).toBe(true);
        expect(result.title).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long input', () => {
      const longInput = 'Add task: ' + 'a'.repeat(500);
      const result = VoiceTaskParser.parseVoiceInput(longInput);
      
      expect(result.isValid).toBe(true);
      expect(result.title).toBeTruthy();
    });

    it('should handle special characters', () => {
      const result = VoiceTaskParser.parseVoiceInput('Buy $100 worth of supplies @ store');
      
      expect(result.isValid).toBe(true);
      expect(result.title).toContain('$100');
    });

    it('should handle mixed case input', () => {
      const result = VoiceTaskParser.parseVoiceInput('ADD TASK: BUY GROCERIES');
      
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('BUY GROCERIES');
    });

    it('should handle multiple spaces', () => {
      const result = VoiceTaskParser.parseVoiceInput('Add    task:    Buy    groceries');
      
      expect(result.title).toBe('Buy groceries');
      expect(result.title).not.toContain('  '); // No double spaces
    });

    it('should handle input with only whitespace', () => {
      const result = VoiceTaskParser.parseVoiceInput('   ');
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('Holiday Parsing', () => {
    it('should parse Christmas', () => {
      const result = VoiceTaskParser.parseVoiceInput('Task on Christmas');
      expect(result.dueDate).toBe('2024-12-25');
    });

    it('should parse Halloween', () => {
      const result = VoiceTaskParser.parseVoiceInput('Task on Halloween');
      expect(result.dueDate).toBe('2024-10-31');
    });

    it('should parse New Year', () => {
      const result = VoiceTaskParser.parseVoiceInput('Task on New Year');
      expect(result.dueDate).toBe('2025-01-01');
    });
  });
});

