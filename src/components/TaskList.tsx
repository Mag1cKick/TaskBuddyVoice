import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TaskBadges from "@/components/TaskBadges";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high' | null;
  due_date: string | null;
  due_time: string | null;
  category: string | null;
  description: string | null;
  updated_at: string | null;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState<'priority' | 'due_date' | 'created_at'>('priority');
  const { toast } = useToast();

  // Advanced sorting function: Priority → Due Date → Creation Time
  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      // First, separate completed from uncompleted tasks
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Uncompleted tasks first
      }

      // Priority sorting (high > medium > low > null)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 0;
      const bPriority = b.priority ? priorityOrder[b.priority] : 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      // Due date sorting (sooner dates first, null dates last)
      if (a.due_date && b.due_date) {
        const aDate = new Date(a.due_date).getTime();
        const bDate = new Date(b.due_date).getTime();
        if (aDate !== bDate) {
          return aDate - bDate; // Sooner dates first
        }
        
        // If dates are the same, sort by time
        if (a.due_time && b.due_time) {
          const [aHour, aMin] = a.due_time.split(':').map(Number);
          const [bHour, bMin] = b.due_time.split(':').map(Number);
          const aMinutes = aHour * 60 + aMin;
          const bMinutes = bHour * 60 + bMin;
          if (aMinutes !== bMinutes) {
            return aMinutes - bMinutes; // Earlier times first
          }
        } else if (a.due_time && !b.due_time) {
          return -1; // Tasks with times come first
        } else if (!a.due_time && b.due_time) {
          return 1; // Tasks with times come first
        }
      } else if (a.due_date && !b.due_date) {
        return -1; // Tasks with due dates come first
      } else if (!a.due_date && b.due_date) {
        return 1; // Tasks with due dates come first
      }

      // Finally, sort by creation time (newest first)
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });
  };

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
      return;
    }

    // Apply sorting after fetching
    const sortedTasks = sortTasks(data || []);
    setTasks(sortedTasks);
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">No tasks yet. Use the microphone to add one!</p>
        <p className="text-xs text-muted-foreground">Try saying: "Add urgent task: Finish presentation"</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Advanced sort indicator */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Sorted by: Priority → Due Date → Due Time → Creation Time
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowUpDown className="w-4 h-4" />
          Smart Sort
        </div>
      </div>

      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
            task.completed 
              ? 'border-gray-200 dark:border-gray-700 opacity-75' 
              : task.priority === 'high'
                ? 'border-red-200 dark:border-red-800 shadow-red-100/50 dark:shadow-red-900/20'
                : task.priority === 'medium'
                  ? 'border-yellow-200 dark:border-yellow-800 shadow-yellow-100/50 dark:shadow-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id, task.completed)}
              className="flex-shrink-0 mt-1"
            />
            
            <div className="flex-1 min-w-0">
              {/* Task title */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <span
                  className={`text-sm font-medium leading-relaxed ${
                    task.completed 
                      ? "line-through text-muted-foreground" 
                      : "text-foreground"
                  }`}
                >
                  {task.title}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 w-8 h-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Task badges */}
              <TaskBadges
                priority={task.priority}
                dueDate={task.due_date}
                dueTime={task.due_time}
                createdAt={task.created_at}
                completed={task.completed}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;