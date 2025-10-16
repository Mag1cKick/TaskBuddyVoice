import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Calendar, TrendingUp, CheckCircle, Clock, Target, BarChart3, Sparkles } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface WeeklyStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  high_priority_tasks: number
  medium_priority_tasks: number
  low_priority_tasks: number
  categories_used: string[]
  completion_rate: number
  daily_breakdown: {
    date: string
    day_name: string
    task_count: number
    completed_count: number
  }[]
}

interface WeeklyDigestProps {
  userId?: string
}

export default function WeeklyDigest({ userId }: WeeklyDigestProps) {
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { toast } = useToast()

  const fetchWeeklyStats = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Calculate date range for last 7 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      // Fetch tasks from last 7 days
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (error) throw error

      // Calculate stats from the tasks data
      const totalTasks = tasks?.length || 0
      const completedTasks = tasks?.filter(task => task.completed).length || 0
      const pendingTasks = totalTasks - completedTasks
      const highPriorityTasks = tasks?.filter(task => task.priority === 'high').length || 0
      const mediumPriorityTasks = tasks?.filter(task => task.priority === 'medium').length || 0
      const lowPriorityTasks = tasks?.filter(task => task.priority === 'low').length || 0
      
      const categories = tasks?.filter(task => task.category).map(task => task.category) || []
      const categoriesUsed = [...new Set(categories)]
      
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      
      // Calculate daily breakdown
      const dailyBreakdown: { [key: string]: { date: string, day_name: string, task_count: number, completed_count: number } } = {}
      
      tasks?.forEach(task => {
        const taskDate = new Date(task.created_at)
        const dateKey = taskDate.toISOString().split('T')[0]
        const dayName = taskDate.toLocaleDateString('en-US', { weekday: 'long' })
        
        if (!dailyBreakdown[dateKey]) {
          dailyBreakdown[dateKey] = {
            date: dateKey,
            day_name: dayName,
            task_count: 0,
            completed_count: 0
          }
        }
        
        dailyBreakdown[dateKey].task_count++
        if (task.completed) {
          dailyBreakdown[dateKey].completed_count++
        }
      })

      const stats: WeeklyStats = {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        pending_tasks: pendingTasks,
        high_priority_tasks: highPriorityTasks,
        medium_priority_tasks: mediumPriorityTasks,
        low_priority_tasks: lowPriorityTasks,
        categories_used: categoriesUsed,
        completion_rate: completionRate,
        daily_breakdown: Object.values(dailyBreakdown)
      }

      setStats(stats)
    } catch (error) {
      console.error('Error fetching weekly stats:', error)
      toast({
        title: "Error",
        description: "Failed to load weekly digest. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId && isVisible) {
      fetchWeeklyStats()
    }
  }, [userId, isVisible])

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getCompletionRateEmoji = (rate: number) => {
    if (rate >= 80) return '🎉'
    if (rate >= 60) return '👍'
    return '💪'
  }

  const getMostActiveDay = () => {
    if (!stats?.daily_breakdown || stats.daily_breakdown.length === 0) return 'No data'
    return stats.daily_breakdown.reduce((max, day) => 
      day.task_count > max.task_count ? day : max
    ).day_name.trim()
  }

  const formatDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  }

  if (!isVisible) {
    return (
      <div className="mb-6">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline" 
          className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/30 dark:hover:to-blue-800/30"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Show Weekly Digest
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <Card className="bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-slate-800 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Weekly Digest
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                {formatDateRange()}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost" 
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading your weekly summary...</span>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_tasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed_tasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending_tasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-lg border">
                  <div className={`text-2xl font-bold ${getCompletionRateColor(stats.completion_rate)}`}>
                    {stats.completion_rate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Completion</div>
                </div>
              </div>

              {/* Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Priority Breakdown
                  </h3>
                  <div className="space-y-2">
                    {stats.high_priority_tasks > 0 && (
                      <div className="flex justify-between items-center">
                        <Badge variant="destructive" className="text-xs">🔴 High</Badge>
                        <span className="font-medium">{stats.high_priority_tasks}</span>
                      </div>
                    )}
                    {stats.medium_priority_tasks > 0 && (
                      <div className="flex justify-between items-center">
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">🟡 Medium</Badge>
                        <span className="font-medium">{stats.medium_priority_tasks}</span>
                      </div>
                    )}
                    {stats.low_priority_tasks > 0 && (
                      <div className="flex justify-between items-center">
                        <Badge className="bg-green-500 hover:bg-green-600 text-xs">🟢 Low</Badge>
                        <span className="font-medium">{stats.low_priority_tasks}</span>
                      </div>
                    )}
                    {stats.high_priority_tasks === 0 && stats.medium_priority_tasks === 0 && stats.low_priority_tasks === 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No priority tasks this week
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Quick Facts
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Most active day:</span>
                      <span className="font-medium">{getMostActiveDay()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Daily average:</span>
                      <span className="font-medium">{(stats.total_tasks / 7).toFixed(1)} tasks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Categories used:</span>
                      <span className="font-medium">{stats.categories_used.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {stats.categories_used.length > 0 && (
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">🏷️ Categories Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.categories_used.map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivational Message */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {stats.total_tasks === 0 ? '🌱' : getCompletionRateEmoji(stats.completion_rate)}
                  </div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {stats.total_tasks === 0 
                      ? "Ready to start fresh? Add some tasks and let's get going!" 
                      : stats.completion_rate >= 80 
                      ? "Outstanding work! You're crushing your goals!" 
                      : stats.completion_rate >= 60 
                      ? "Great progress! Keep up the momentum!" 
                      : "Every step counts! Let's make next week even better!"}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={fetchWeeklyStats} 
                  disabled={loading}
                  variant="outline"
                  className="border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Refresh Stats
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-300">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No data available for this week.</p>
              <p className="text-sm mt-2">Start creating tasks to see your weekly digest!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

