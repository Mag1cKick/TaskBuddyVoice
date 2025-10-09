import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceTaskParser, ParsedTask } from "@/utils/voiceTaskParser";

interface VoiceInputProps {
  onTranscript: (text: string, parsedTask?: any) => void;
  onTaskParsed?: (parsedTask: ParsedTask) => void;
}

const VoiceInput = ({ onTranscript, onTaskParsed }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Raw transcript:', transcript);
      
      // Parse the voice input
      const parsedTask = VoiceTaskParser.parseVoiceInput(transcript);
      console.log('Parsed task:', parsedTask);
      
      if (parsedTask.isValid) {
        // Show review popup for parsed tasks
        onTaskParsed?.(parsedTask);
      } else {
        // For simple tasks, create directly
        onTranscript(transcript);
        toast({
          title: "Added as simple task",
          description: `"${transcript}"`,
          duration: 3000,
        });
      }
      
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast({
        title: "Error",
        description: "Could not recognize speech. Please try again.",
        variant: "destructive",
      });
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [onTranscript, toast]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now to add a task",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Voice command hints */}
      {showHints && (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 dark:border-slate-700/40 max-w-sm">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Voice Commands
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>"Add urgent task: Finish presentation"</p>
            <p>"Remind me to call mom tomorrow at 2 PM"</p>
            <p>"Create task: Buy groceries this afternoon"</p>
            <p>"Schedule meeting next week at 10 AM"</p>
          </div>
        </div>
      )}

      {/* Main voice button */}
      <div className="relative">
        <Button
          onClick={toggleListening}
          onMouseEnter={() => setShowHints(true)}
          onMouseLeave={() => setShowHints(false)}
          size="lg"
          className={`rounded-full w-16 h-16 transition-all duration-300 ${
            isListening 
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse shadow-lg shadow-red-500/25" 
              : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 hover:scale-105"
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white drop-shadow-sm" />
          ) : (
            <Mic className="w-6 h-6 text-white drop-shadow-sm" />
          )}
        </Button>

        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -inset-2 rounded-full border-2 border-red-300 animate-ping opacity-20"></div>
        )}
      </div>

      {/* Status text */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        {isListening 
          ? "🎤 Listening... Speak your task" 
          : "Tap to add tasks with your voice"
        }
      </p>
    </div>
  );
};

export default VoiceInput;