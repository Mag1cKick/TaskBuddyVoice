// Voice parser utility for processing voice commands into structured tasks
export interface ParsedTask {
  title: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
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

    // Clean up the task title
    taskTitle = this.cleanTaskTitle(taskTitle, priority, category, dueDate);

    return {
      title: taskTitle,
      priority,
      category,
      dueDate,
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

  private static cleanTaskTitle(title: string, priority?: string, category?: string, dueDate?: string): string {
    // Remove any remaining artifacts
    title = title.replace(/^(to|and|also|please)\s+/i, '');
    title = title.replace(/\s+(to|and|also|please)$/i, '');
    
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
      "Add task: Buy groceries",
      "Remind me to call mom tomorrow",
      "Create urgent task: Finish presentation",
      "Schedule meeting with team next week",
      "Don't forget to take medicine",
      "I need to work on the project today",
      "Add low priority task: Clean garage"
    ];
  }
}
