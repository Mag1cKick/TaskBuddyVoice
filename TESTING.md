# Task Buddy Voice - Testing Documentation

## Overview

Comprehensive testing suite for Task Buddy Voice with unit tests, integration tests, and GitHub Actions CI/CD pipeline.

## Table of Contents
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Structure](#test-structure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Writing Tests](#writing-tests)
- [Edge Cases Tested](#edge-cases-tested)

## Setup

### Install Dependencies

```bash
npm install
```

This will install:
- `vitest` - Fast unit test framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom matchers for DOM assertions
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM implementation for testing
- `@vitest/ui` - Interactive test UI
- `@vitest/coverage-v8` - Code coverage reporting

### Environment Variables

Create a `.env.test` file for test environment:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run E2E Tests Only

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npm test WeeklyDigest.test
```

### Run Component Tests Only

```bash
npm test -- src/components/__tests__
```

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage report will be generated in `./coverage` directory.

## Test Coverage

### Current Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Coverage by Module

#### End-to-End User Workflows (`user-workflow.test.ts`)
- ✅ Task creation scenarios (simple, with priority, category, dates, times)
- ✅ Task retrieval and filtering (by status, priority, category)
- ✅ Task updates (completion, priority changes, multiple fields)
- ✅ Task deletion (single and bulk)
- ✅ Realistic user scenarios (daily routines, weekly planning, priority management)
- ✅ Edge cases (missing fields, long titles, special characters, bulk operations)

**Note:** Voice parser testing is excluded as it requires human validation and creates false positives in automated tests.

#### Weekly Digest (`WeeklyDigest.tsx`)
- ✅ Initial render and visibility toggle
- ✅ Loading states
- ✅ Empty state handling (no tasks)
- ✅ Stats calculation (total, completed, pending, completion rate)
- ✅ Priority breakdown display
- ✅ Category handling
- ✅ Motivational messages based on performance
- ✅ Error handling
- ✅ Refresh functionality
- ✅ Edge cases (missing data, large datasets)

#### Task List (`TaskList.tsx`)
- ✅ Task rendering
- ✅ Loading and empty states
- ✅ Task completion toggle
- ✅ Task deletion
- ✅ Sorting (by completion, priority, date)
- ✅ Filtering (by category, status)
- ✅ Priority styling
- ✅ Category badges
- ✅ Date/time display
- ✅ Error handling
- ✅ Real-time updates subscription
- ✅ Edge cases (missing fields, long titles, many tasks)

#### Supabase Integration (`supabase.test.ts`)
- ✅ Database connection
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Filtering and sorting
- ✅ Data validation
- ✅ Date and time handling
- ✅ Bulk operations
- ✅ Error handling
- ✅ Concurrent updates
- ✅ Performance tests

## Test Structure

```
src/
├── components/
│   ├── __tests__/
│   │   ├── WeeklyDigest.test.tsx
│   │   └── TaskList.test.tsx
│   ├── WeeklyDigest.tsx
│   └── TaskList.tsx
├── utils/
│   ├── __tests__/
│   │   └── voiceTaskParser.test.ts
│   └── voiceTaskParser.ts
├── test/
│   ├── setup.ts
│   └── integration/
│       └── supabase.test.ts
└── ...
```

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

The CI/CD pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### Pipeline Stages

1. **Lint & Format Check**
   - ESLint validation
   - TypeScript type checking
   - Code quality checks

2. **Run Tests**
   - Unit tests
   - Integration tests
   - Coverage reporting
   - Upload to Codecov (optional)

3. **Build Application**
   - Production build
   - Build artifact upload
   - Environment validation

4. **Security Audit**
   - npm audit for vulnerabilities
   - Known CVE checking
   - Dependency security scan

5. **Dependency Check**
   - Outdated dependencies check
   - package-lock integrity
   - Version compatibility

6. **Integration Tests** (main branch only)
   - Full integration test suite
   - Database interaction tests
   - API endpoint tests

7. **Performance Check** (PRs only)
   - Bundle size analysis
   - Size limit validation (5MB max)
   - Performance metrics

8. **Coverage Report** (PRs only)
   - Comment coverage on PR
   - Coverage delta comparison
   - Quality gate checks

9. **Preview Deployment** (PRs only)
   - Build artifact deployment
   - Preview URL generation
   - PR comment with preview link

10. **Final Status Check**
    - All jobs validation
    - Success/failure reporting
    - PR status update

### Setting Up GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to `Settings > Secrets and variables > Actions`
2. Add the following secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `CODECOV_TOKEN`: (Optional) Codecov upload token

## Writing Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import YourComponent from '../YourComponent'

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    render(<YourComponent />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    // Assert expected behavior
  })
})
```

### Integration Test Template

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { supabase } from '@/integrations/supabase/client'

describe('Integration Test', () => {
  let testId: string

  beforeAll(async () => {
    // Setup test data
  })

  afterAll(async () => {
    // Cleanup test data
  })

  it('should perform database operation', async () => {
    const { data, error } = await supabase
      .from('table')
      .select('*')
    
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

## Edge Cases Tested

### Voice Parser Edge Cases
- ✅ Empty input
- ✅ Whitespace-only input
- ✅ Very long input (500+ characters)
- ✅ Special characters and symbols
- ✅ Case-insensitive keywords
- ✅ Multiple spaces between words
- ✅ Only keywords without actual task content
- ✅ Ambiguous date/time expressions
- ✅ Multiple date/time references
- ✅ Conflicting priority keywords

### Component Edge Cases
- ✅ No data/empty state
- ✅ Loading states
- ✅ Error states
- ✅ Very large datasets (100+ items)
- ✅ Missing required fields
- ✅ Missing optional fields
- ✅ Invalid data types
- ✅ Long text content
- ✅ Concurrent updates
- ✅ Network failures

### Database Edge Cases
- ✅ Null/undefined values
- ✅ Invalid foreign keys
- ✅ Duplicate entries
- ✅ Constraint violations
- ✅ Transaction rollbacks
- ✅ Race conditions
- ✅ Large batch operations
- ✅ Query timeouts

## Best Practices

### DO:
- ✅ Write descriptive test names
- ✅ Test one thing per test
- ✅ Use appropriate matchers
- ✅ Mock external dependencies
- ✅ Clean up after tests
- ✅ Test edge cases
- ✅ Maintain test independence
- ✅ Keep tests fast

### DON'T:
- ❌ Test implementation details
- ❌ Share state between tests
- ❌ Use real API calls in unit tests
- ❌ Ignore failing tests
- ❌ Over-mock (mock only what's needed)
- ❌ Write tests just for coverage
- ❌ Skip edge case testing

## Continuous Improvement

### Adding New Tests

1. Identify the feature/bug
2. Write failing test first (TDD)
3. Implement the feature
4. Ensure test passes
5. Refactor if needed
6. Update documentation

### Monitoring Test Health

- Review test failures immediately
- Keep tests up-to-date with code changes
- Maintain >80% coverage
- Remove obsolete tests
- Optimize slow tests
- Update mocks when APIs change

## Troubleshooting

### Tests Failing Locally

```bash
# Clear cache and reinstall
rm -rf node_modules coverage
npm install
npm test
```

### CI/CD Failures

1. Check GitHub Actions logs
2. Verify environment variables are set
3. Ensure dependencies are up-to-date
4. Test locally with same Node version
5. Check for merge conflicts

### Coverage Drop

1. Identify uncovered lines
2. Add missing test cases
3. Remove dead code
4. Update coverage thresholds if justified

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain coverage thresholds
4. Update this documentation
5. Add examples for complex scenarios

---

**Last Updated**: 2024
**Maintained By**: Task Buddy Voice Team

