// Voice parser utility for processing voice commands into structured tasks
export interface ParsedTask {
  title: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  dueTime?: string;
  description?: string;
  isValid: boolean;
  originalText: string;
}

export class VoiceTaskParser {
  private static readonly TASK_TRIGGERS = [
    'add task', 'create task', 'new task', 'add to do', 'create to do',
    'remind me to', 'i need to', 'don\'t forget to', 'make sure to',
    'schedule', 'plan to', 'set reminder'
  ];

  private static readonly PRIORITY_KEYWORDS = {
    high: ['urgent', 'important', 'asap', 'critical', 'immediately', 'now', 'priority'],
    medium: ['soon', 'moderate', 'normal'],
    low: ['later', 'eventually', 'when possible', 'low priority', 'sometime']
  };

  private static readonly TIME_PATTERNS = [
    // Today/Tomorrow
    { pattern: /\b(today|tonight)\b/i, type: 'today' },
    { pattern: /\btomorrow\b/i, type: 'tomorrow' },
    
    // Days of week
    { pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'weekday' },
    
    // Relative time
    { pattern: /\bin (\d+) (day|days|week|weeks|month|months)\b/i, type: 'relative' },
    { pattern: /\bnext (week|month)\b/i, type: 'next' },
    
    // Specific dates
    { pattern: /\bon ([a-zA-Z]+ \d{1,2})\b/i, type: 'specific' }
  ];

  private static readonly TIME_OF_DAY_PATTERNS = [
    // Specific times
    { pattern: /\bat (\d{1,2}):(\d{2})\s*(am|pm)?\b/i, type: 'specific_time' },
    { pattern: /\bat (\d{1,2})\s*(am|pm)\b/i, type: 'hour_time' },
    
    // General time periods
    { pattern: /\bin the (morning|afternoon|evening|night)\b/i, type: 'period' },
    { pattern: /\b(morning|afternoon|evening|tonight)\b/i, type: 'period_simple' },
    
    // Relative times
    { pattern: /\bin (\d+) (hour|hours|minute|minutes)\b/i, type: 'relative_time' }
  ];

  private static readonly CATEGORY_KEYWORDS = {
    work: ['work', 'office', 'meeting', 'project', 'deadline', 'presentation', 'email'],
    personal: ['home', 'family', 'personal', 'health', 'exercise', 'doctor'],
    shopping: ['buy', 'purchase', 'shop', 'grocery', 'store', 'market'],
    learning: ['learn', 'study', 'read', 'course', 'book', 'research'],
    social: ['call', 'text', 'meet', 'visit', 'party', 'dinner', 'lunch']
  };

  public static parseVoiceInput(transcript: string): ParsedTask {
    const cleanText = transcript.toLowerCase().trim();
    
    // Check if this looks like a task command
    const isTaskCommand = this.TASK_TRIGGERS.some(trigger => 
      cleanText.includes(trigger.toLowerCase())
    );

    // Extract the main task content
    let taskTitle = this.extractTaskTitle(cleanText);
    
    // If no explicit trigger found, assume the whole text is a task
    if (!isTaskCommand && taskTitle === cleanText) {
      taskTitle = this.capitalizeFirst(transcript.trim());
    }

    const priority = this.extractPriority(cleanText);
    const category = this.extractCategory(cleanText);
    const dueDate = this.extractDueDate(cleanText);
    const dueTime = this.extractDueTime(cleanText);
    const description = this.extractDescription(cleanText, taskTitle);

    // Clean up the task title
    taskTitle = this.cleanTaskTitle(taskTitle, priority, category, dueDate, dueTime);

    return {
      title: taskTitle,
      priority,
      category,
      dueDate,
      dueTime,
      description,
      isValid: taskTitle.length > 0,
      originalText: transcript
    };
  }

  private static extractTaskTitle(text: string): string {
    let title = text;

    // Remove common trigger phrases
    for (const trigger of this.TASK_TRIGGERS) {
      const regex = new RegExp(`\\b${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      title = title.replace(regex, '').trim();
    }

    // Remove time-related phrases that were extracted
    for (const timePattern of this.TIME_PATTERNS) {
      title = title.replace(timePattern.pattern, '').trim();
    }

    // Remove priority keywords
    Object.values(this.PRIORITY_KEYWORDS).flat().forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      title = title.replace(regex, '').trim();
    });

    // Clean up extra whitespace and connecting words
    title = title.replace(/\b(to|and|also|please)\b/gi, ' ').trim();
    title = title.replace(/\s+/g, ' ').trim();

    return this.capitalizeFirst(title);
  }

  private static extractPriority(text: string): 'low' | 'medium' | 'high' | undefined {
    for (const [priority, keywords] of Object.entries(this.PRIORITY_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return priority as 'low' | 'medium' | 'high';
      }
    }
    return undefined;
  }

  private static extractCategory(text: string): string | undefined {
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    return undefined;
  }

  private static extractDueDate(text: string): string | undefined {
    for (const timePattern of this.TIME_PATTERNS) {
      const match = text.match(timePattern.pattern);
      if (match) {
        return this.convertToDateString(match[0], timePattern.type);
      }
    }
    return undefined;
  }

  private static extractDueTime(text: string): string | undefined {
    for (const timePattern of this.TIME_OF_DAY_PATTERNS) {
      const match = text.match(timePattern.pattern);
      if (match) {
        return this.convertToTimeString(match[0], timePattern.type, match);
      }
    }
    return undefined;
  }

  private static extractDescription(text: string, title: string): string | undefined {
    // Look for description patterns like "description:", "note:", "details:"
    const descriptionPatterns = [
      /\bdescription:?\s*(.+)/i,
      /\bnote:?\s*(.+)/i,
      /\bdetails:?\s*(.+)/i,
      /\bwith:?\s*(.+)/i
    ];

    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return this.capitalizeFirst(match[1].trim());
      }
    }

    return undefined;
  }

  private static convertToDateString(match: string, type: string): string {
    const now = new Date();
    
    switch (type) {
      case 'today':
        return now.toISOString().split('T')[0];
      
      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      
      case 'weekday':
        // Simple weekday parsing - could be enhanced
        return `Next ${match}`;
      
      case 'relative':
      case 'next':
      case 'specific':
        return match; // Return as-is for now, could be enhanced with date parsing
      
      default:
        return match;
    }
  }

  private static convertToTimeString(match: string, type: string, groups: RegExpMatchArray): string | undefined {
    switch (type) {
      case 'specific_time':
        // Handle formats like "2:30 PM" or "14:30"
        const hour = parseInt(groups[1]);
        const minute = groups[2] ? parseInt(groups[2]) : 0;
        const ampm = groups[3]?.toLowerCase();
        
        let hour24 = hour;
        if (ampm === 'pm' && hour !== 12) hour24 += 12;
        if (ampm === 'am' && hour === 12) hour24 = 0;
        
        return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      case 'hour_time':
        // Handle formats like "2 PM" or "2AM"
        const hourOnly = parseInt(groups[1]);
        const ampmOnly = groups[2]?.toLowerCase();
        
        let hour24Only = hourOnly;
        if (ampmOnly === 'pm' && hourOnly !== 12) hour24Only += 12;
        if (ampmOnly === 'am' && hourOnly === 12) hour24Only = 0;
        
        return `${hour24Only.toString().padStart(2, '0')}:00`;
      
      case 'period':
      case 'period_simple':
        // Convert general periods to approximate times
        const period = groups[1]?.toLowerCase() || match.toLowerCase();
        switch (period) {
          case 'morning': return '09:00';
          case 'afternoon': return '14:00';
          case 'evening': return '18:00';
          case 'night':
          case 'tonight': return '20:00';
          default: return undefined;
        }
      
      case 'relative_time':
        // Handle "in 2 hours" etc.
        const amount = parseInt(groups[1]);
        const unit = groups[2].toLowerCase();
        const now = new Date();
        
        if (unit.startsWith('hour')) {
          now.setHours(now.getHours() + amount);
        } else if (unit.startsWith('minute')) {
          now.setMinutes(now.getMinutes() + amount);
        }
        
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      default:
        return undefined;
    }
  }

  private static cleanTaskTitle(title: string, priority?: string, category?: string, dueDate?: string, dueTime?: string): string {
    // Remove any remaining artifacts
    title = title.replace(/^(to|and|also|please)\s+/i, '');
    title = title.replace(/\s+(to|and|also|please)$/i, '');
    
    // Remove time-related phrases that were extracted
    for (const timePattern of this.TIME_OF_DAY_PATTERNS) {
      title = title.replace(timePattern.pattern, '').trim();
    }
    
    // Ensure it starts with a capital letter
    return this.capitalizeFirst(title.trim());
  }

  private static capitalizeFirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Helper method to get parsing suggestions for users
  public static getVoiceCommandExamples(): string[] {
    return [
      "Add urgent task: Finish presentation",
      "Remind me to call mom tomorrow at 2 PM",
      "Create task: Buy groceries this afternoon",
      "Schedule meeting with team next week at 10 AM",
      "Don't forget to take medicine tonight",
      "I need to work on the project today at 9:30 AM",
      "Add low priority task: Clean garage this weekend",
      "Create task: Doctor appointment note: bring insurance card",
      "Remind me to exercise tomorrow morning"
    ];
  }
}
