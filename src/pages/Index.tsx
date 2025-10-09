import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import VoiceInput from "@/components/VoiceInput";
import TaskList from "@/components/TaskList";
import Logo from "@/components/Logo";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const handleVoiceTranscript = async (text: string, parsedTask?: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Use parsed task title if available, otherwise use raw text
    const taskTitle = parsedTask?.title || text;

    // Convert parsed due date to proper format if available
    let dueDate = null;
    if (parsedTask?.dueDate) {
      // Handle different date formats from the parser
      if (parsedTask.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Already in YYYY-MM-DD format
        dueDate = parsedTask.dueDate;
      } else {
        // Try to parse natural language dates
        const today = new Date();
        if (parsedTask.dueDate.toLowerCase().includes('today')) {
          dueDate = today.toISOString().split('T')[0];
        } else if (parsedTask.dueDate.toLowerCase().includes('tomorrow')) {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          dueDate = tomorrow.toISOString().split('T')[0];
        }
      }
    }

    // Convert due time to proper format
    let dueTime = null;
    if (parsedTask?.dueTime) {
      dueTime = parsedTask.dueTime;
    }

    const { error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: session.user.id,
          title: taskTitle,
          priority: parsedTask?.priority || null,
          category: parsedTask?.category || null,
          due_date: dueDate,
          due_time: dueTime,
          description: parsedTask?.description || null,
        },
      ]);

    if (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Make sure the database schema is up to date.",
        variant: "destructive",
      });
    } else {
      console.log('Task created successfully:', { taskTitle, parsedTask, dueDate, dueTime });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Task Buddy Voice
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        <main className="space-y-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              <h2 className="text-xl font-semibold text-foreground">Your Tasks</h2>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                Enhanced Mode
              </span>
            </div>
            <TaskList />
          </div>
        </main>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl shadow-purple-500/20 border border-white/30 dark:border-slate-700/40">
            <VoiceInput onTranscript={handleVoiceTranscript} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
