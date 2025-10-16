# Task Buddy Voice 🎤✨

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/TaskBuddyVoice/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/TaskBuddyVoice/actions/workflows/ci.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-80%25-green)](./coverage)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A powerful voice-powered task management application with intelligent parsing, weekly insights, and comprehensive testing.

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

### Developer Experience
- ✅ **Comprehensive Testing**: 80%+ code coverage
- 🔄 **CI/CD Pipeline**: Automated testing and deployment
- 🛡️ **Type Safety**: Full TypeScript implementation
- 📖 **Documentation**: Extensive docs for contributors

## 🧪 Testing

This project has **comprehensive test coverage** with unit tests, integration tests, and automated CI/CD.

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run integration tests
npm test -- tests/integration
```

### Test Coverage

- **E2E User Workflows**: Real user scenarios and task operations
- **Components**: 85%+ coverage (WeeklyDigest, TaskList)
- **Supabase Integration**: Full CRUD operations testing
- **CI/CD**: Automated testing on every PR

**Note**: Voice parser testing is done manually as it requires human validation for accuracy.

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 🚀 CI/CD Pipeline

Automated GitHub Actions workflow runs on every push and PR:

- ✅ Linting & Type Checking
- ✅ Unit & Integration Tests
- ✅ Code Coverage Reports
- ✅ Build Verification
- ✅ Security Audits
- ✅ Bundle Size Analysis
- ✅ Performance Checks

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

### Testing
- **Vitest** - Fast unit test framework
- **Testing Library** - React component testing
- **jsdom** - DOM implementation for tests
- **GitHub Actions** - CI/CD automation

### Additional Tools
- **Web Speech API** - Voice recognition
- **Resend** - Email delivery service
- **date-fns** - Date manipulation
- **React Query** - Data fetching

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/65911553-39df-45a8-960f-bc6a9649f73c) and click on Share -> Publish.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/TaskBuddyVoice.git
cd TaskBuddyVoice

# Install dependencies
npm install

# Run tests
npm test

# Start development
npm run dev
```

### Before Submitting a PR

- ✅ All tests pass (`npm test`)
- ✅ Code coverage maintained (`npm run test:coverage`)
- ✅ Linting passes (`npm run lint`)
- ✅ TypeScript compiles (`npx tsc --noEmit`)

## 📚 Documentation

- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [CONTRIBUTING.md](./.github/CONTRIBUTING.md) - Contribution guidelines
- [WEEKLY_DIGEST_SETUP.md](./WEEKLY_DIGEST_SETUP.md) - Email digest configuration

## 🔧 Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

For the weekly digest email feature, also set in Supabase Edge Functions:
```env
RESEND_API_KEY=your_resend_api_key
```

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
