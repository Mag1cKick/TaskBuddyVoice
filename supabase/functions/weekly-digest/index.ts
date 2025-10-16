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

interface User {
  id: string
  email: string
  email_notifications?: boolean
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

    // Get all users who want email notifications
    const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }

    const emailResults = []

    // Process each user
    for (const user of users.users) {
      if (!user.email) continue

      try {
        // Fetch user's tasks from last 7 days
        const { data: tasks, error: tasksError } = await supabaseClient
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        if (tasksError) {
          console.error(`Error fetching tasks for user ${user.id}:`, tasksError)
          continue
        }

        // Skip users with no tasks this week
        if (!tasks || tasks.length === 0) {
          continue
        }

        // Calculate weekly statistics
        const stats = calculateWeeklyStats(tasks)

        // Generate email content
        const emailContent = generateEmailHTML(stats, startDate, endDate, user.email)

        // Send email using Resend
        const emailResult = await sendWeeklyDigestEmail(user.email, emailContent, stats)
        
        emailResults.push({
          userId: user.id,
          email: user.email,
          success: emailResult.success,
          error: emailResult.error || null
        })

      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError)
        emailResults.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: userError.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${emailResults.length} users`,
        results: emailResults,
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
    console.error('Weekly digest error:', error)
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

async function sendWeeklyDigestEmail(email: string, htmlContent: string, stats: WeeklyStats) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Task Buddy Voice <digest@taskbuddyvoice.com>',
        to: [email],
        subject: `📊 Your Weekly Task Digest - ${stats.completionRate}% Complete!`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Resend API error: ${response.status} - ${errorData}`)
    }

    const result = await response.json()
    return { success: true, messageId: result.id }
    
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

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

function generateEmailHTML(stats: WeeklyStats, startDate: Date, endDate: Date, userEmail: string): string {
  const weekRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  const motivationalMessage = stats.completionRate >= 80 
    ? '🎉 Outstanding work! You\'re crushing your goals!' 
    : stats.completionRate >= 60 
    ? '👍 Great progress! Keep up the momentum!' 
    : '💪 Every step counts! Let\'s make next week even better!'

  const priorityColor = stats.completionRate >= 80 ? '#10b981' : stats.completionRate >= 60 ? '#f59e0b' : '#ef4444'

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Task Digest</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-number { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #64748b; font-size: 14px; }
        .completion-rate { color: ${priorityColor}; }
        .insights { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .insights h3 { margin: 0 0 15px 0; color: #334155; }
        .insight-item { display: flex; justify-content: space-between; margin: 8px 0; }
        .categories { margin: 15px 0; }
        .category-tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 20px; margin: 4px; font-size: 12px; }
        .motivation { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
        .motivation-emoji { font-size: 40px; margin-bottom: 10px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .footer a { color: #8b5cf6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Weekly Task Digest</h1>
            <p>${weekRange}</p>
        </div>
        
        <div class="content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" style="color: #3b82f6;">${stats.totalTasks}</div>
                    <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #10b981;">${stats.completedTasks}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #f59e0b;">${stats.pendingTasks}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number completion-rate">${stats.completionRate}%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
            </div>

            <div class="insights">
                <h3>📈 Weekly Insights</h3>
                <div class="insight-item">
                    <span>Most active day:</span>
                    <strong>${stats.mostActiveDay}</strong>
                </div>
                <div class="insight-item">
                    <span>Daily average:</span>
                    <strong>${stats.averageTasksPerDay} tasks</strong>
                </div>
                <div class="insight-item">
                    <span>High priority tasks:</span>
                    <strong>${stats.highPriorityTasks}</strong>
                </div>
                <div class="insight-item">
                    <span>Top category:</span>
                    <strong>${stats.topCategory}</strong>
                </div>
                
                ${stats.categoriesUsed.length > 0 ? `
                <div class="categories">
                    <strong>Categories used:</strong><br>
                    ${stats.categoriesUsed.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                </div>
                ` : ''}
            </div>

            <div class="motivation">
                <div class="motivation-emoji">${stats.completionRate >= 80 ? '🎉' : stats.completionRate >= 60 ? '👍' : '💪'}</div>
                <div style="font-size: 18px; font-weight: 600;">${motivationalMessage}</div>
            </div>
        </div>

        <div class="footer">
            <p>This digest was generated by <a href="#">Task Buddy Voice</a></p>
            <p>Keep up the great work with your voice-powered task management! 🎤✨</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

/* 
 * Setup Instructions:
 * 1. Set RESEND_API_KEY environment variable in Supabase Edge Functions
 * 2. Configure your domain in Resend dashboard
 * 3. Deploy this function: supabase functions deploy weekly-digest
 * 4. Set up cron job to run weekly (see WEEKLY_DIGEST_SETUP.md)
 */

