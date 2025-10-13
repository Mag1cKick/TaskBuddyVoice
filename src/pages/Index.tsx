import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import VoiceInput from "@/components/VoiceInput";
import TaskList from "@/components/TaskList";
import Logo from "@/components/Logo";
import { LogOut, Check, X, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ParsedTask } from "@/utils/voiceTaskParser";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [currentParsedTask, setCurrentParsedTask] = useState<ParsedTask | null>(null);
  const [editedTask, setEditedTask] = useState<ParsedTask | null>(null);

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

  // Function to show review popup when task is parsed
  const handleTaskParsed = (parsedTask: ParsedTask) => {
    setCurrentParsedTask(parsedTask);
    setEditedTask({ ...parsedTask });
    setShowReviewPopup(true);
  };

  // Handle confirming the reviewed task
  const handleConfirmTask = async () => {
    if (!editedTask) return;
    
    await handleVoiceTranscript(editedTask.title, editedTask);
    setShowReviewPopup(false);
    setCurrentParsedTask(null);
    setEditedTask(null);
    
    toast({
      title: "Task created!",
      description: `"${editedTask.title}" has been added to your tasks`,
      duration: 3000,
    });
  };

  // Handle canceling the review
  const handleCancelReview = () => {
    setShowReviewPopup(false);
    setCurrentParsedTask(null);
    setEditedTask(null);
    
    toast({
      title: "Task cancelled",
      description: "Voice input was cancelled",
      duration: 2000,
    });
  };

  // Helper functions for confidence display
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 dark:text-green-400";
    if (confidence >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <TrendingUp className="w-4 h-4" />;
    if (confidence >= 60) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
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
    <>
      {/* Full Screen Review & Edit Popup */}
      {showReviewPopup && currentParsedTask && editedTask && (
        <div className="fixed top-5 left-5 right-5 bottom-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] overflow-y-auto">
          <div className="p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-3xl font-bold flex items-center gap-4 text-slate-800 dark:text-slate-100">
                <AlertCircle className="w-8 h-8 text-blue-500" />
                Review & Edit Your Task
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`${getConfidenceColor(currentParsedTask.confidence)} border-current flex items-center gap-3 px-5 py-3 text-lg font-semibold`}
                >
                  {getConfidenceIcon(currentParsedTask.confidence)}
                  <span>{getConfidenceBadge(currentParsedTask.confidence)} Confidence</span>
                  <span className="text-base opacity-80">({currentParsedTask.confidence}%)</span>
                </Badge>
              </div>
            </div>

            {/* Original Voice Input */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-2xl p-8 mb-10 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">🎤 Your voice input:</p>
                {currentParsedTask.confidence >= 75 && (
                  <Button
                    onClick={handleConfirmTask}
                    size="lg"
                    disabled={!editedTask.title.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    ✅ Perfect, create it!
                  </Button>
                )}
              </div>
              <p className="text-xl font-mono italic text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-700/70 rounded-lg p-4">
                "{currentParsedTask.originalText}"
              </p>
            </div>

            <div className="space-y-10">
              {/* Confidence Details */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                <h4 className="text-xl font-bold mb-6 text-blue-800 dark:text-blue-200 flex items-center gap-4">
                  🧠 Parsing Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentParsedTask.confidenceReasons.map((reason, index) => (
                    <div key={index} className="flex items-center gap-4 text-base text-blue-700 dark:text-blue-300 bg-white/70 dark:bg-slate-800/70 rounded-xl p-4 shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <span className="font-medium">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Task Fields */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xl font-bold mb-8 text-slate-800 dark:text-slate-200 flex items-center gap-4">
                  ✏️ Edit Task Details
                </h4>
                
                <div className="grid gap-10">
                  {/* Task Title */}
                  <div>
                    <Label htmlFor="title" className="text-xl font-bold mb-4 block text-slate-700 dark:text-slate-300">📝 Task Title</Label>
                    <Input
                      id="title"
                      value={editedTask.title}
                      onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="text-xl py-5 px-8 h-16 bg-white dark:bg-slate-700 border-2 focus:border-blue-500"
                      placeholder="Enter task title..."
                    />
                  </div>

                  {/* Priority and Category Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div>
                      <Label htmlFor="priority" className="text-xl font-bold mb-4 block text-slate-700 dark:text-slate-300">🎯 Priority</Label>
                      <Select 
                        value={editedTask.priority || "none"} 
                        onValueChange={(value) => 
                          setEditedTask({ 
                            ...editedTask, 
                            priority: value === "none" ? undefined : value as 'low' | 'medium' | 'high'
                          })
                        }
                      >
                        <SelectTrigger className="text-xl py-5 px-8 h-16 bg-white dark:bg-slate-700 border-2">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          <SelectItem value="none">No Priority</SelectItem>
                          <SelectItem value="low">🟢 Low Priority</SelectItem>
                          <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                          <SelectItem value="high">🔴 High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-xl font-bold mb-4 block text-slate-700 dark:text-slate-300">🏷️ Category</Label>
                      <Input
                        id="category"
                        value={editedTask.category || ""}
                        onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value || undefined })}
                        className="text-xl py-5 px-8 h-16 bg-white dark:bg-slate-700 border-2 focus:border-blue-500"
                        placeholder="work, personal, shopping, etc."
                      />
                    </div>
                  </div>

                  {/* Due Date and Time Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div>
                      <Label htmlFor="dueDate" className="text-xl font-bold mb-4 block text-slate-700 dark:text-slate-300">📅 Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={editedTask.dueDate || ""}
                        onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value || undefined })}
                        className="text-xl py-5 px-8 h-16 bg-white dark:bg-slate-700 border-2 focus:border-blue-500"
                      />
                      {editedTask.dueDate && (
                        <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 bg-white/70 dark:bg-slate-700/70 px-5 py-3 rounded-xl">
                          📆 {formatDate(editedTask.dueDate)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dueTime" className="text-xl font-bold mb-4 block text-slate-700 dark:text-slate-300">⏰ Due Time</Label>
                      <Input
                        id="dueTime"
                        type="time"
                        value={editedTask.dueTime || ""}
                        onChange={(e) => setEditedTask({ ...editedTask, dueTime: e.target.value || undefined })}
                        className="text-xl py-5 px-8 h-16 bg-white dark:bg-slate-700 border-2 focus:border-blue-500"
                      />
                      {editedTask.dueTime && (
                        <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 bg-white/70 dark:bg-slate-700/70 px-5 py-3 rounded-xl">
                          🕐 {formatTime(editedTask.dueTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-xl font-bold mb-4 block text-slate-700 dark:text-slate-300">
                      📄 Description <span className="text-lg font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={editedTask.description || ""}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value || undefined })}
                      className="text-xl py-5 px-8 min-h-[120px] resize-none bg-white dark:bg-slate-700 border-2 focus:border-blue-500"
                      placeholder="Add any additional notes or details about this task..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Button 
                  onClick={handleConfirmTask}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-xl shadow-xl hover:shadow-2xl transition-all duration-200 h-16"
                  disabled={!editedTask.title.trim()}
                >
                  <Check className="w-7 h-7 mr-4" />
                  {editedTask.title.trim() ? "✅ Create This Task" : "⚠️ Add Task Title"}
                </Button>
                <Button 
                  onClick={handleCancelReview}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-3 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold py-6 text-xl transition-all duration-200 h-16 border-slate-300 dark:border-slate-600"
                >
                  <X className="w-7 h-7 mr-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <VoiceInput onTranscript={handleVoiceTranscript} onTaskParsed={handleTaskParsed} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Index;
