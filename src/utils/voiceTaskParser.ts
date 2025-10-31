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
  confidence: number; // 0-100
  confidenceReasons: string[];
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
    { pattern: /\bnext (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'next_weekday' },
    { pattern: /\bthis (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'this_weekday' },
    
    // Relative time - enhanced
    { pattern: /\bin (\d+) (day|days)\b/i, type: 'relative_days' },
    { pattern: /\bin (\d+) (week|weeks)\b/i, type: 'relative_weeks' },
    { pattern: /\bin (\d+) (month|months)\b/i, type: 'relative_months' },
    { pattern: /\bin (\d+) (year|years)\b/i, type: 'relative_years' },
    { pattern: /\b(\d+) (day|days) from now\b/i, type: 'relative_days' },
    { pattern: /\b(\d+) (week|weeks) from now\b/i, type: 'relative_weeks' },
    { pattern: /\b(\d+) (month|months) from now\b/i, type: 'relative_months' },
    { pattern: /\b(\d+) (year|years) from now\b/i, type: 'relative_years' },
    
    // Next/This periods
    { pattern: /\bnext week\b/i, type: 'next_week' },
    { pattern: /\bnext month\b/i, type: 'next_month' },
    { pattern: /\bnext year\b/i, type: 'next_year' },
    { pattern: /\bthis week\b/i, type: 'this_week' },
    { pattern: /\bthis month\b/i, type: 'this_month' },
    { pattern: /\bthis year\b/i, type: 'this_year' },
    
    // Holidays and special dates
    { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?\b/i, type: 'month_day' },
    { pattern: /\b(\d{1,2})(st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i, type: 'day_of_month' },
    { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?\s+(\d{4})\b/i, type: 'month_day_year' },
    { pattern: /\b(\d{1,2})(st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i, type: 'day_of_month_year' },
    
    // Common holidays
    { pattern: /\b(fourth of july|july 4th|independence day)(\s+(\d{4}))?\b/i, type: 'july_fourth' },
    { pattern: /\b(christmas|christmas day)(\s+(\d{4}))?\b/i, type: 'christmas' },
    { pattern: /\b(new year|new years|january 1st)(\s+(\d{4}))?\b/i, type: 'new_year' },
    { pattern: /\b(halloween|october 31st)(\s+(\d{4}))?\b/i, type: 'halloween' },
    
    // Specific date formats
    { pattern: /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/i, type: 'date_slash' },
    { pattern: /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/i, type: 'date_dash' },
    { pattern: /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/i, type: 'iso_date' }
  ];

  private static readonly TIME_OF_DAY_PATTERNS = [
    // Specific times with "at"
    { pattern: /\bat (\d{1,2}):(\d{2})\s*(am|pm)?\b/i, type: 'specific_time' },
    { pattern: /\bat (\d{1,2})\s*(am|pm)\b/i, type: 'hour_time' },
    
    // Specific times without "at"
    { pattern: /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i, type: 'specific_time' },
    { pattern: /\b(\d{1,2})\s*(am|pm)\b/i, type: 'hour_time' },
    { pattern: /\b(\d{1,2}):(\d{2})\b/i, type: 'time_24h' }, // 24-hour format
    
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

    // Calculate confidence and reasons
    const { confidence, reasons } = this.calculateConfidence(cleanText, {
      title: taskTitle,
      priority,
      category,
      dueDate,
      dueTime,
      description,
      isTaskCommand
    });

    return {
      title: taskTitle,
      priority,
      category,
      dueDate,
      dueTime,
      description,
      isValid: taskTitle.length > 0,
      originalText: transcript,
      confidence,
      confidenceReasons: reasons
    };
  }

  private static extractTaskTitle(text: string): string {
    let title = text;

    // Remove common trigger phrases
    for (const trigger of this.TASK_TRIGGERS) {
      const regex = new RegExp(`\\b${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      title = title.replace(regex, '').trim();
    }

    // Remove colons that might be left after trigger removal
    title = title.replace(/^:\s*/, '').trim();

    // Remove description patterns
    title = title.replace(/\bdescription:?\s*.+/i, '').trim();
    title = title.replace(/\bnote:?\s*.+/i, '').trim();
    title = title.replace(/\bdetails:?\s*.+/i, '').trim();
    title = title.replace(/\bwith:?\s*.+/i, '').trim();

    // Remove time-related phrases that were extracted
    for (const timePattern of this.TIME_PATTERNS) {
      title = title.replace(timePattern.pattern, '').trim();
    }

    // Remove priority keywords
    Object.values(this.PRIORITY_KEYWORDS).flat().forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      title = title.replace(regex, '').trim();
    });

    // Remove category keywords
    Object.values(this.CATEGORY_KEYWORDS).flat().forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      title = title.replace(regex, '').trim();
    });

    // Clean up extra whitespace and connecting words
    title = title.replace(/\b(to|and|also|please)\b/gi, ' ').trim();
    title = title.replace(/\s+/g, ' ').trim();

    return this.capitalizeFirst(title);
  }

  private static extractPriority(text: string): 'low' | 'medium' | 'high' | undefined {
    // Check in order: high -> medium -> low (most specific first)
    const priorityOrder: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    
    for (const priority of priorityOrder) {
      const keywords = this.PRIORITY_KEYWORDS[priority];
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return priority;
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
      
      case 'tomorrow': {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      }
      
      case 'weekday': {
        const dayName = match.toLowerCase();
        const targetDay = this.getDayOfWeek(dayName);
        const daysUntilTarget = (targetDay - now.getDay() + 7) % 7 || 7; // Next occurrence
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysUntilTarget);
        return targetDate.toISOString().split('T')[0];
      }
      
      case 'next_weekday': {
        const dayName = match.match(/next (\w+)/i)?.[1]?.toLowerCase();
        const targetDay = this.getDayOfWeek(dayName || '');
        const daysUntilTarget = (targetDay - now.getDay() + 7) % 7 || 7;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysUntilTarget + 7); // Next week
        return targetDate.toISOString().split('T')[0];
      }
      
      case 'this_weekday': {
        const dayName = match.match(/this (\w+)/i)?.[1]?.toLowerCase();
        const targetDay = this.getDayOfWeek(dayName || '');
        const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysUntilTarget);
        return targetDate.toISOString().split('T')[0];
      }
      
      case 'relative_days': {
        const daysMatch = match.match(/(\d+)/);
        const days = daysMatch ? parseInt(daysMatch[1]) : 0;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + days);
        return targetDate.toISOString().split('T')[0];
      }
      
      case 'relative_weeks': {
        const weeksMatch = match.match(/(\d+)/);
        const weeks = weeksMatch ? parseInt(weeksMatch[1]) : 0;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + (weeks * 7));
        return targetDate.toISOString().split('T')[0];
      }
      
      case 'relative_months': {
        const monthsMatch = match.match(/(\d+)/);
        const months = monthsMatch ? parseInt(monthsMatch[1]) : 0;
        const targetDate = new Date(now);
        targetDate.setMonth(now.getMonth() + months);
        return targetDate.toISOString().split('T')[0];
      }
      
      case 'relative_years': {
        const yearsMatch = match.match(/(\d+)/);
        const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
        const targetDate = new Date(now);
        targetDate.setFullYear(now.getFullYear() + years);
        return targetDate.toISOString().split('T')[0];
      }
      
      case 'next_week': {
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + (7 - now.getDay() + 1)); // Next Monday
        return nextWeek.toISOString().split('T')[0];
      }
      
      case 'next_month': {
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1, 1); // First of next month
        return nextMonth.toISOString().split('T')[0];
      }
      
      case 'next_year': {
        const nextYear = new Date(now);
        nextYear.setFullYear(now.getFullYear() + 1, 0, 1); // January 1st of next year
        return nextYear.toISOString().split('T')[0];
      }
      
      case 'this_week':
        return now.toISOString().split('T')[0]; // Today
      
      case 'this_month':
        return now.toISOString().split('T')[0]; // Today
      
      case 'this_year':
        return now.toISOString().split('T')[0]; // Today
      
      case 'month_day': {
        const monthMatch = match.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i);
        if (monthMatch) {
          const month = this.getMonthNumber(monthMatch[1]);
          const day = parseInt(monthMatch[2]);
          const year = now.getFullYear();
          // Use UTC to avoid timezone issues
          const targetDate = new Date(Date.UTC(year, month - 1, day));
          
          // If the date has passed this year, use next year
          if (targetDate < now) {
            targetDate.setUTCFullYear(year + 1);
          }
          
          return targetDate.toISOString().split('T')[0];
        }
        break;
      }
      
      case 'day_of_month': {
        const dayMatch = match.match(/(\d{1,2})(?:st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          const month = this.getMonthNumber(dayMatch[2]);
          const year = now.getFullYear();
          const targetDate = new Date(year, month - 1, day);
          
          // If the date has passed this year, use next year
          if (targetDate < now) {
            targetDate.setFullYear(year + 1);
          }
          
          return targetDate.toISOString().split('T')[0];
        }
        break;
      }
      
      case 'month_day_year': {
        const yearMatch = match.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{4})/i);
        if (yearMatch) {
          const month = this.getMonthNumber(yearMatch[1]);
          const day = parseInt(yearMatch[2]);
          const year = parseInt(yearMatch[3]);
          const targetDate = new Date(year, month - 1, day);
          return targetDate.toISOString().split('T')[0];
        }
        break;
      }
      
      case 'day_of_month_year': {
        const yearMatch = match.match(/(\d{1,2})(?:st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
        if (yearMatch) {
          const day = parseInt(yearMatch[1]);
          const month = this.getMonthNumber(yearMatch[2]);
          const year = parseInt(yearMatch[3]);
          const targetDate = new Date(year, month - 1, day);
          return targetDate.toISOString().split('T')[0];
        }
        break;
      }
      
      case 'july_fourth': {
        const yearMatch = match.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : now.getFullYear();
        const julyFourth = new Date(year, 6, 4); // July 4th
        
        // If this year's July 4th has passed and no year specified, use next year
        if (!yearMatch && julyFourth < now) {
          julyFourth.setFullYear(year + 1);
        }
        
        return julyFourth.toISOString().split('T')[0];
      }
      
      case 'christmas': {
        const yearMatch = match.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : now.getFullYear();
        // Use UTC to avoid timezone issues
        const christmas = new Date(Date.UTC(year, 11, 25)); // December 25th
        
        if (!yearMatch && christmas < now) {
          christmas.setUTCFullYear(year + 1);
        }
        
        return christmas.toISOString().split('T')[0];
      }
      
      case 'new_year': {
        const yearMatch = match.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : now.getFullYear() + 1;
        // Use UTC to avoid timezone issues
        const newYear = new Date(Date.UTC(year, 0, 1)); // January 1st
        return newYear.toISOString().split('T')[0];
      }
      
      case 'halloween': {
        const yearMatch = match.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : now.getFullYear();
        // Use UTC to avoid timezone issues
        const halloween = new Date(Date.UTC(year, 9, 31)); // October 31st
        
        if (!yearMatch && halloween < now) {
          halloween.setUTCFullYear(year + 1);
        }
        
        return halloween.toISOString().split('T')[0];
      }
      
      case 'date_slash': {
        const slashMatch = match.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (slashMatch) {
          const month = parseInt(slashMatch[1]);
          const day = parseInt(slashMatch[2]);
          const year = parseInt(slashMatch[3]);
          const targetDate = new Date(year, month - 1, day);
          return targetDate.toISOString().split('T')[0];
        }
        break;
      }
      
      case 'date_dash': {
        const dashMatch = match.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
        if (dashMatch) {
          const month = parseInt(dashMatch[1]);
          const day = parseInt(dashMatch[2]);
          const year = parseInt(dashMatch[3]);
          const targetDate = new Date(year, month - 1, day);
          return targetDate.toISOString().split('T')[0];
        }
        break;
      }
      
      case 'iso_date': {
        const isoMatch = match.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (isoMatch) {
          return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
        }
        break;
      }
      
      default:
        return match;
    }
    
    return match;
  }

  // Helper methods for date parsing
  private static getDayOfWeek(dayName: string): number {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.indexOf(dayName.toLowerCase());
  }

  private static getMonthNumber(monthName: string): number {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];
    return months.indexOf(monthName.toLowerCase()) + 1;
  }

  private static convertToTimeString(match: string, type: string, groups: RegExpMatchArray): string | undefined {
    switch (type) {
      case 'specific_time': {
        // Handle formats like "2:30 PM" or "14:30"
        const hour = parseInt(groups[1]);
        const minute = groups[2] ? parseInt(groups[2]) : 0;
        const ampm = groups[3]?.toLowerCase();
        
        let hour24 = hour;
        if (ampm === 'pm' && hour !== 12) hour24 += 12;
        if (ampm === 'am' && hour === 12) hour24 = 0;
        
        return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
      
      case 'hour_time': {
        // Handle formats like "2 PM" or "2AM"
        const hourOnly = parseInt(groups[1]);
        const ampmOnly = groups[2]?.toLowerCase();
        
        let hour24Only = hourOnly;
        if (ampmOnly === 'pm' && hourOnly !== 12) hour24Only += 12;
        if (ampmOnly === 'am' && hourOnly === 12) hour24Only = 0;
        
        return `${hour24Only.toString().padStart(2, '0')}:00`;
      }
      
      case 'time_24h': {
        // Handle 24-hour format like "14:30"
        const hour24h = parseInt(groups[1]);
        const minute24h = groups[2] ? parseInt(groups[2]) : 0;
        
        // Validate 24-hour format
        if (hour24h >= 0 && hour24h <= 23 && minute24h >= 0 && minute24h <= 59) {
          return `${hour24h.toString().padStart(2, '0')}:${minute24h.toString().padStart(2, '0')}`;
        }
        return undefined;
      }
      
      case 'period':
      case 'period_simple': {
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
      }
      
      case 'relative_time': {
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
      }
      
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
    
    // If the string is all uppercase, keep it that way
    if (str === str.toUpperCase() && str.length > 1) {
      return str;
    }
    
    // Otherwise, capitalize first letter and keep rest as-is
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Helper method to get parsing suggestions for users
  public static getVoiceCommandExamples(): string[] {
    return [
      "Add urgent task: Finish presentation tomorrow 10 AM",
      "Remind me to call mom two days from now at 2 PM",
      "Create task: Buy groceries next Monday morning",
      "Schedule meeting with team next week at 10:30 AM",
      "Don't forget to take medicine tonight at 8 PM",
      "I need to file taxes by April 15th",
      "Add task: Birthday party on July 4th 2026",
      "Create low priority task: Clean garage this weekend",
      "Remind me to exercise in 3 days at 7 AM",
      "Schedule dentist appointment next month in the afternoon",
      "Add work task: Submit report by Christmas",
      "Create task: Halloween costume shopping in October"
    ];
  }

  private static calculateConfidence(text: string, parsed: {
    title: string;
    priority?: string;
    category?: string;
    dueDate?: string;
    dueTime?: string;
    description?: string;
    isTaskCommand: boolean;
  }): { confidence: number; reasons: string[] } {
    let confidence = 0;
    const reasons: string[] = [];

    // Base confidence for having a title
    if (parsed.title && parsed.title.length > 2) {
      confidence += 30;
      reasons.push('Clear task title identified');
    } else {
      reasons.push('Task title unclear');
    }

    // Confidence for task command recognition
    if (parsed.isTaskCommand) {
      confidence += 20;
      reasons.push('Clear task command detected');
    } else {
      confidence += 10;
      reasons.push('Implied task (no explicit command)');
    }

    // Confidence for extracted metadata
    if (parsed.priority) {
      confidence += 15;
      reasons.push(`Priority detected: ${parsed.priority}`);
    }

    if (parsed.dueDate) {
      confidence += 15;
      reasons.push(`Due date detected: ${parsed.dueDate}`);
    }

    if (parsed.dueTime) {
      confidence += 10;
      reasons.push(`Due time detected: ${parsed.dueTime}`);
    }

    if (parsed.category) {
      confidence += 5;
      reasons.push(`Category detected: ${parsed.category}`);
    }

    if (parsed.description) {
      confidence += 5;
      reasons.push('Additional description found');
    }

    // Penalty for very short or unclear text
    if (text.length < 10) {
      confidence -= 10;
      reasons.push('Very short input');
    }

    // Bonus for clear, well-structured commands
    if (text.includes(':') && parsed.isTaskCommand) {
      confidence += 5;
      reasons.push('Well-structured command');
    }

    // Ensure confidence is within bounds
    confidence = Math.max(0, Math.min(100, confidence));

    return { confidence, reasons };
  }
}
