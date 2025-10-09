import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const iconSize = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer ring with gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5">
        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
          {/* Inner circle with voice waves animation */}
          <div className="relative flex items-center justify-center">
            {/* Voice wave rings */}
            <div className="absolute inset-0 rounded-full animate-ping bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"></div>
            <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 scale-75"></div>
            
            {/* Microphone icon */}
            <svg
              className={`${iconSize[size]} text-gradient fill-current`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="micGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <path
                fill="url(#micGradient)"
                d="M12 2C13.1 2 14 2.9 14 4V10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10V4C10 2.9 10.9 2 12 2ZM19 10V12C19 15.3 16.3 18 13 18V22H11V18C7.7 18 5 15.3 5 12V10H7V12C7 14.2 8.8 16 11 16H13C15.2 16 17 14.2 17 12V10H19Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
