import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeeklyStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  highPriorityTasks: number
  categoriesUsed: string[]
  completionRate: number
  mostActiveDay: string
  topCategory: string
  averageTasksPerDay: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get date range for last 7 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    // Fetch tasks from last 7 days
    const { data: tasks, error } = await supabaseClient
      .from('tasks')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      throw error
    }

    // Calculate weekly statistics
    const stats: WeeklyStats = calculateWeeklyStats(tasks || [])

    // Generate digest content
    const digest = generateDigestContent(stats, startDate, endDate)

    // For now, return the digest data
    // In production, you might want to send emails, push notifications, etc.
    return new Response(
      JSON.stringify({
        success: true,
        digest,
        stats,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function calculateWeeklyStats(tasks: any[]): WeeklyStats {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length
  
  const categories = tasks
    .filter(task => task.category)
    .map(task => task.category)
  const categoriesUsed = [...new Set(categories)]
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Find most active day
  const dayStats: { [key: string]: number } = {}
  tasks.forEach(task => {
    const day = new Date(task.created_at).toLocaleDateString('en-US', { weekday: 'long' })
    dayStats[day] = (dayStats[day] || 0) + 1
  })
  const mostActiveDay = Object.keys(dayStats).reduce((a, b) => 
    dayStats[a] > dayStats[b] ? a : b, 'Monday'
  )
  
  // Find top category
  const categoryStats: { [key: string]: number } = {}
  categories.forEach(category => {
    categoryStats[category] = (categoryStats[category] || 0) + 1
  })
  const topCategory = Object.keys(categoryStats).reduce((a, b) => 
    categoryStats[a] > categoryStats[b] ? a : b, 'None'
  )
  
  const averageTasksPerDay = Math.round((totalTasks / 7) * 10) / 10

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    categoriesUsed,
    completionRate,
    mostActiveDay,
    topCategory,
    averageTasksPerDay
  }
}

function generateDigestContent(stats: WeeklyStats, startDate: Date, endDate: Date): string {
  const weekRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  
  return `
🗓️ **Weekly Task Digest** (${weekRange})

📊 **Overview:**
• Total tasks created: ${stats.totalTasks}
• Tasks completed: ${stats.completedTasks}
• Tasks pending: ${stats.pendingTasks}
• Completion rate: ${stats.completionRate}%

🎯 **Productivity Insights:**
• Most active day: ${stats.mostActiveDay}
• Average tasks per day: ${stats.averageTasksPerDay}
• High priority tasks: ${stats.highPriorityTasks}

📁 **Categories:**
• Top category: ${stats.topCategory}
• Categories used: ${stats.categoriesUsed.join(', ') || 'None'}

${stats.completionRate >= 70 ? '🎉 Great work! You had a productive week!' : 
  stats.completionRate >= 50 ? '👍 Good progress! Keep it up!' : 
  '💪 Room for improvement - let\'s make next week even better!'}
  `.trim()
}

/* Deno Deploy configuration for cron:
 * Add this to your Deno Deploy dashboard:
 * Schedule: "0 9 * * 1" (Every Monday at 9 AM)
 * Function: weekly-digest
 */

