import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TaskBadgesProps {
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  completed?: boolean;
}

const TaskBadges: React.FC<TaskBadgesProps> = ({ 
  priority, 
  dueDate, 
  dueTime,
  createdAt, 
  completed = false 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-3 h-3" />;
      case 'medium':
        return <Clock className="w-3 h-3" />;
      case 'low':
        return <CheckCircle2 className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays === -1) return 'Yesterday';
    if (diffInDays > 1 && diffInDays <= 7) return `In ${diffInDays} days`;
    if (diffInDays < -1 && diffInDays >= -7) return `${Math.abs(diffInDays)} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isDueSoon = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 1 && diffInDays >= 0;
  };

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date < now && !completed;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Priority Badge */}
      {priority && (
        <Badge 
          variant="outline" 
          className={`text-xs font-medium ${getPriorityColor(priority)} flex items-center gap-1`}
        >
          {getPriorityIcon(priority)}
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      )}

      {/* Due Date Badge */}
      {dueDate && (
        <Badge 
          variant="outline" 
          className={`text-xs font-medium flex items-center gap-1 ${
            isOverdue(dueDate) 
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
              : isDueSoon(dueDate)
                ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
          }`}
        >
          <Calendar className="w-3 h-3" />
          {formatDate(dueDate)}
          {isOverdue(dueDate) && !completed && ' (Overdue)'}
        </Badge>
      )}

      {/* Due Time Badge */}
      {dueTime && (
        <Badge 
          variant="outline" 
          className="text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 flex items-center gap-1"
        >
          <Clock className="w-3 h-3" />
          {formatTime(dueTime)}
        </Badge>
      )}

      {/* Created Time Badge */}
      <Badge 
        variant="outline" 
        className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 flex items-center gap-1"
      >
        <Clock className="w-3 h-3" />
        {getRelativeTime(createdAt)}
      </Badge>
    </div>
  );
};

export default TaskBadges;
