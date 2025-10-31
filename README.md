# Task Buddy Voice 🎤✨

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A powerful voice-powered task management application with intelligent parsing and weekly insights.

## Project info

**URL**: https://lovable.dev/projects/65911553-39df-45a8-960f-bc6a9649f73c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/65911553-39df-45a8-960f-bc6a9649f73c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## ✨ Features

### Voice-Powered Task Management
- 🎤 **Voice Input**: Create tasks using natural language
- 🧠 **Intelligent Parsing**: Automatically extracts priorities, categories, dates, times, and descriptions
- ✅ **Smart Task Creation**: Context-aware task generation with confidence scoring

### Task Organization
- 📋 **Priority Levels**: High, medium, and low priority tasks
- 🏷️ **Categories**: Work, personal, shopping, health, finance
- 📅 **Due Dates & Times**: Flexible date/time parsing (today, tomorrow, next week, specific dates)
- 🔄 **Smart Sorting**: Auto-sort by completion, priority, due date, and time

### Weekly Insights
- 📊 **Weekly Digest**: Comprehensive statistics and progress tracking
- 📧 **Email Notifications**: Automated weekly summary emails
- 🎯 **Performance Tracking**: Completion rates and productivity insights
- 💪 **Motivational Messages**: Encouraging feedback based on performance

### Production Ready
- 🚀 **Code Splitting**: Optimized bundle sizes with lazy loading
- 🔒 **Environment Validation**: Runtime checks for configuration
- 🛡️ **Error Boundaries**: Graceful error handling
- 📊 **Monitoring**: Sentry integration for error tracking
- ⚡ **Performance**: Optimized chunks and caching

### Developer Experience
- 🛡️ **Type Safety**: Full TypeScript implementation
- 📖 **Documentation**: Extensive docs for contributors
- 🔍 **Dependency Management**: Automated audits and updates

## What technologies are used for this project?

This project is built with:

### Core
- **Vite** - Lightning-fast build tool
- **TypeScript** - Type-safe development
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **shadcn-ui** - Beautiful component library

### Backend
- **Supabase** - PostgreSQL database and authentication
- **Supabase Edge Functions** - Serverless functions for weekly digest

### Additional Tools
- **Web Speech API** - Voice recognition
- **Resend** - Email delivery service
- **React Query** - Data fetching
- **Sentry** - Error tracking and monitoring (optional)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/65911553-39df-45a8-960f-bc6a9649f73c) and click on Share -> Publish.

## 🤝 Contributing

We welcome contributions!

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/TaskBuddyVoice.git
cd TaskBuddyVoice

# Install dependencies
npm install

# Start development
npm run dev
```

### Before Submitting a PR

- ✅ Linting passes (`npm run lint`)
- ✅ TypeScript compiles (`npx tsc --noEmit`)
- ✅ App builds successfully (`npm run build`)

## 📚 Documentation

- [PRODUCTION_READY.md](./PRODUCTION_READY.md) - Production features and monitoring setup
- [DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md) - Dependency strategy and maintenance
- [WEEKLY_DIGEST_SETUP.md](./WEEKLY_DIGEST_SETUP.md) - Email digest configuration

## 🔧 Environment Variables

Create a `.env` file:

```env
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional (for error tracking)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ENVIRONMENT=production
```

For the weekly digest email feature, also set in Supabase Edge Functions:
```env
RESEND_API_KEY=your_resend_api_key
```

See [PRODUCTION_READY.md](./PRODUCTION_READY.md) for detailed setup instructions.

## 🚀 Deployment

### Quick Deploy

**Heroku:**
```bash
git push heroku main
```

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
- Connect repository in Netlify dashboard
- Configure build settings
- Deploy

See [FINAL_DEPLOYMENT_CHECKLIST.md](./FINAL_DEPLOYMENT_CHECKLIST.md) for complete deployment guide.

---

## 🔄 CI/CD

GitHub Actions automatically:
- ✅ Runs tests on every push
- ✅ Checks for security issues
- ✅ Builds the application
- ✅ Deploys to production (main branch)

See [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) for setup instructions.

---

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com)
- Email delivery via [Resend](https://resend.com)
